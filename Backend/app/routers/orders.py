import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, selectinload

from app.auth.dependencies import get_current_active_user, get_optional_current_user
from app.core.enums import AuditAction
from app.core.permissions import require_roles, role_name
from app.database import get_db
from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderCreate, OrderStatusUpdate
from app.services.audit import log_action, model_to_dict
from app.services.orders import create_order_from_payload
from app.utils.response import success_response

router = APIRouter(prefix="/orders", tags=["orders"])
order_staff = require_roles("order_manager", "super_admin")


@router.post("", status_code=201)
def create_order(
    payload: OrderCreate,
    request: Request,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_current_user),
) -> dict:
    order = create_order_from_payload(db, payload=payload, user_id=user.id if user else None)
    db.flush()
    log_action(db, actor=user, table_name="orders", record_id=str(order.id), action=AuditAction.create, after_data=model_to_dict(order), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(order)
    return success_response("Order created", order)


@router.get("/my")
def my_orders(db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> dict:
    rows = (
        db.query(Order)
        .options(selectinload(Order.items))
        .filter(Order.user_id == user.id, Order.is_deleted.is_(False))
        .order_by(Order.created_at.desc())
        .all()
    )
    return success_response(data=rows)


@router.get("/admin/all")
def list_orders(include_deleted: bool = False, db: Session = Depends(get_db), _: User = Depends(order_staff)) -> dict:
    query = db.query(Order).options(selectinload(Order.items))
    if not include_deleted:
        query = query.filter(Order.is_deleted.is_(False))
    return success_response(data=query.order_by(Order.created_at.desc()).all())


@router.get("/admin/history")
def order_history(db: Session = Depends(get_db), _: User = Depends(order_staff)) -> dict:
    rows = (
        db.query(Order)
        .options(selectinload(Order.items))
        .filter(Order.is_deleted.is_(False))
        .order_by(Order.created_at.desc())
        .all()
    )
    return success_response(data=rows)


@router.get("/{order_id}")
def get_order(order_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> dict:
    order = db.query(Order).options(selectinload(Order.items)).filter(Order.id == order_id).first()
    if not order or order.is_deleted:
        raise HTTPException(status_code=404, detail="Order not found")
    if role_name(user) == "customer" and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return success_response(data=order)


@router.patch("/{order_id}/status")
def update_order_status(order_id: uuid.UUID, payload: OrderStatusUpdate, request: Request, db: Session = Depends(get_db), actor: User = Depends(order_staff)) -> dict:
    order = db.get(Order, order_id)
    if not order or order.is_deleted:
        raise HTTPException(status_code=404, detail="Order not found")
    before = model_to_dict(order)
    order.status = payload.status
    db.flush()
    log_action(db, actor=actor, table_name="orders", record_id=str(order.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(order), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(order)
    return success_response("Order status updated", order)


@router.delete("/{order_id}")
def delete_order(order_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(order_staff)) -> dict:
    order = db.get(Order, order_id)
    if not order or order.is_deleted:
        raise HTTPException(status_code=404, detail="Order not found")
    before = model_to_dict(order)
    order.soft_delete()
    db.flush()
    log_action(db, actor=actor, table_name="orders", record_id=str(order.id), action=AuditAction.delete, before_data=before, after_data=model_to_dict(order), ip_address=request.client.host if request.client else None)
    db.commit()
    return success_response("Order deleted", {"id": order_id})


@router.patch("/{order_id}/restore")
def restore_order(order_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(order_staff)) -> dict:
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    before = model_to_dict(order)
    order.restore()
    db.flush()
    log_action(db, actor=actor, table_name="orders", record_id=str(order.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(order), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(order)
    return success_response("Order restored", order)
