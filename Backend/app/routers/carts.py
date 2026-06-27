import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, selectinload

from app.auth.dependencies import get_current_active_user
from app.core.enums import AuditAction, CartStatus
from app.database import get_db
from app.models.cart import Cart, CartItem
from app.models.deal import Deal
from app.models.menu import MenuItem
from app.models.user import User
from app.schemas.cart import CartCreate, CartItemCreate, CartItemUpdate
from app.schemas.order import CheckoutRequest
from app.services.audit import log_action, model_to_dict
from app.services.orders import checkout_cart
from app.utils.response import success_response

router = APIRouter(prefix="/carts", tags=["carts"])


def get_owned_cart(db: Session, cart_id: uuid.UUID, user: User) -> Cart:
    cart = (
        db.query(Cart)
        .options(selectinload(Cart.items), selectinload(Cart.qr_session))
        .filter(Cart.id == cart_id, Cart.user_id == user.id, Cart.is_deleted.is_(False))
        .first()
    )
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart


def _target_price(db: Session, payload: CartItemCreate):
    if bool(payload.menu_item_id) == bool(payload.deal_id):
        raise HTTPException(status_code=400, detail="Exactly one of menu_item_id or deal_id is required")
    if payload.menu_item_id:
        item = db.get(MenuItem, payload.menu_item_id)
        if not item or item.is_deleted or not item.is_available:
            raise HTTPException(status_code=404, detail="Menu item not available")
        return item.price
    deal = db.get(Deal, payload.deal_id)
    if not deal or deal.is_deleted or not deal.is_active:
        raise HTTPException(status_code=404, detail="Deal not available")
    return deal.deal_price


@router.post("", status_code=201)
def create_cart(payload: CartCreate, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> dict:
    cart = Cart(user_id=user.id, qr_session_id=payload.qr_session_id, table_number=payload.table_number)
    db.add(cart)
    db.commit()
    db.refresh(cart)
    return success_response("Cart created", cart)


@router.get("/active")
def get_active_cart(db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> dict:
    cart = (
        db.query(Cart)
        .options(selectinload(Cart.items))
        .filter(Cart.user_id == user.id, Cart.status == CartStatus.active, Cart.is_deleted.is_(False))
        .order_by(Cart.created_at.desc())
        .first()
    )
    if not cart:
        raise HTTPException(status_code=404, detail="Active cart not found")
    return success_response(data=cart)


@router.post("/{cart_id}/items")
def add_cart_item(cart_id: uuid.UUID, payload: CartItemCreate, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> dict:
    cart = get_owned_cart(db, cart_id, user)
    if cart.status != CartStatus.active:
        raise HTTPException(status_code=400, detail="Cart is not active")
    unit_price = _target_price(db, payload)
    existing = next((item for item in cart.items if not item.is_deleted and item.menu_item_id == payload.menu_item_id and item.deal_id == payload.deal_id), None)
    if existing:
        existing.quantity += payload.quantity
        existing.notes = payload.notes
    else:
        cart.items.append(CartItem(menu_item_id=payload.menu_item_id, deal_id=payload.deal_id, quantity=payload.quantity, unit_price=unit_price, notes=payload.notes))
    db.commit()
    db.refresh(cart)
    return success_response("Cart item added", cart)


@router.patch("/{cart_id}/items/{item_id}")
def update_cart_item(cart_id: uuid.UUID, item_id: uuid.UUID, payload: CartItemUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> dict:
    cart = get_owned_cart(db, cart_id, user)
    item = next((cart_item for cart_item in cart.items if cart_item.id == item_id and not cart_item.is_deleted), None)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    item.quantity = payload.quantity
    item.notes = payload.notes
    db.commit()
    db.refresh(cart)
    return success_response("Cart item updated", cart)


@router.delete("/{cart_id}/items/{item_id}")
def remove_cart_item(cart_id: uuid.UUID, item_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> dict:
    cart = get_owned_cart(db, cart_id, user)
    item = next((cart_item for cart_item in cart.items if cart_item.id == item_id and not cart_item.is_deleted), None)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    item.soft_delete()
    db.commit()
    return success_response("Cart item removed", {"id": item_id})


@router.post("/{cart_id}/checkout", status_code=201)
def checkout(cart_id: uuid.UUID, payload: CheckoutRequest, request: Request, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> dict:
    if payload.cart_id != cart_id:
        raise HTTPException(status_code=400, detail="cart_id mismatch")
    cart = get_owned_cart(db, cart_id, user)
    order = checkout_cart(db, cart=cart, customer_name=payload.customer_name, customer_phone=payload.customer_phone, special_instructions=payload.special_instructions)
    db.flush()
    log_action(db, actor=user, table_name="orders", record_id=str(order.id), action=AuditAction.create, after_data=model_to_dict(order), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(order)
    return success_response("Cart checked out", order)
