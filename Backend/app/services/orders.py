import uuid
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.core.enums import CartStatus
from app.models.cart import Cart
from app.models.deal import Deal
from app.models.inventory import MenuItemInventory
from app.models.menu import MenuItem
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderItemCreate


def money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _validate_one_target(menu_item_id: uuid.UUID | None, deal_id: uuid.UUID | None) -> None:
    if bool(menu_item_id) == bool(deal_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Each item must reference exactly one menu_item_id or deal_id",
        )


def _active_deal(db: Session, deal_id: uuid.UUID) -> Deal:
    now = datetime.now(timezone.utc)
    deal = db.get(Deal, deal_id)
    if not deal or deal.is_deleted or not deal.is_active:
        raise HTTPException(status_code=404, detail="Deal is not available")
    if deal.starts_at and deal.starts_at > now:
        raise HTTPException(status_code=400, detail="Deal has not started")
    if deal.ends_at and deal.ends_at < now:
        raise HTTPException(status_code=400, detail="Deal has expired")
    return deal


def _available_menu_item(db: Session, menu_item_id: uuid.UUID) -> MenuItem:
    item = (
        db.query(MenuItem)
        .join(MenuItem.category)
        .filter(
            MenuItem.id == menu_item_id,
            MenuItem.is_deleted.is_(False),
            MenuItem.is_available.is_(True),
            MenuItem.category.has(is_deleted=False, is_active=True),
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Menu item is not available")
    return item


def _deduct_inventory_for_menu_item(
    db: Session, *, menu_item_id: uuid.UUID, quantity: int
) -> None:
    mappings = (
        db.query(MenuItemInventory)
        .options(selectinload(MenuItemInventory.inventory_item))
        .filter(
            MenuItemInventory.menu_item_id == menu_item_id,
            MenuItemInventory.is_deleted.is_(False),
        )
        .all()
    )
    for mapping in mappings:
        if mapping.inventory_item and not mapping.inventory_item.is_deleted:
            mapping.inventory_item.quantity_on_hand -= mapping.quantity_required * quantity


def _build_order_item(db: Session, payload: OrderItemCreate) -> OrderItem:
    _validate_one_target(payload.menu_item_id, payload.deal_id)
    if payload.menu_item_id:
        item = _available_menu_item(db, payload.menu_item_id)
        unit_price = money(payload.custom_unit_price) if payload.custom_unit_price is not None else item.price
        _deduct_inventory_for_menu_item(
            db, menu_item_id=payload.menu_item_id, quantity=payload.quantity
        )
        return OrderItem(
            menu_item_id=payload.menu_item_id,
            quantity=payload.quantity,
            unit_price=unit_price,
            subtotal=money(unit_price * payload.quantity),
            notes=payload.notes,
        )

    deal = _active_deal(db, payload.deal_id)
    unit_price = deal.deal_price
    for deal_item in deal.deal_items:
        if not deal_item.is_deleted:
            _available_menu_item(db, deal_item.menu_item_id)
            _deduct_inventory_for_menu_item(
                db,
                menu_item_id=deal_item.menu_item_id,
                quantity=deal_item.quantity * payload.quantity,
            )
    return OrderItem(
        deal_id=payload.deal_id,
        quantity=payload.quantity,
        unit_price=unit_price,
        subtotal=money(unit_price * payload.quantity),
        notes=payload.notes,
    )


def create_order_from_payload(
    db: Session,
    *,
    payload: OrderCreate,
    user_id: uuid.UUID | None,
) -> Order:
    order = Order(
        user_id=user_id,
        qr_session_id=payload.qr_session_id,
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        table_number=payload.table_number,
        special_instructions=payload.special_instructions,
        total_amount=Decimal("0.00"),
    )
    total = Decimal("0.00")
    for item_payload in payload.items:
        order_item = _build_order_item(db, item_payload)
        total += order_item.subtotal
        order.items.append(order_item)
    order.total_amount = money(total)
    db.add(order)
    return order


def checkout_cart(
    db: Session,
    *,
    cart: Cart,
    customer_name: str,
    customer_phone: str,
    special_instructions: str | None,
) -> Order:
    if cart.status != CartStatus.active:
        raise HTTPException(status_code=400, detail="Cart is not active")
    active_items = [item for item in cart.items if not item.is_deleted]
    if not active_items:
        raise HTTPException(status_code=400, detail="Cart has no items")

    payload = OrderCreate(
        customer_name=customer_name,
        customer_phone=customer_phone,
        table_number=cart.table_number or (cart.qr_session.table_number if cart.qr_session else None),
        qr_session_id=cart.qr_session_id,
        special_instructions=special_instructions,
        items=[
            OrderItemCreate(
                menu_item_id=item.menu_item_id,
                deal_id=item.deal_id,
                quantity=item.quantity,
                notes=item.notes,
            )
            for item in active_items
        ],
    )
    order = create_order_from_payload(db, payload=payload, user_id=cart.user_id)
    cart.status = CartStatus.checked_out
    return order
