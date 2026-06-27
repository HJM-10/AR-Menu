import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_active_user
from app.core.enums import AuditAction
from app.core.permissions import require_roles, role_name
from app.database import get_db
from app.models.order import Order
from app.models.payment import Payment, PaymentGateway
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentGatewayCreate, PaymentGatewayUpdate, PaymentStatusUpdate
from app.services.audit import log_action, model_to_dict
from app.utils.response import success_response

router = APIRouter(prefix="/payments", tags=["payments"])
super_admin = require_roles("super_admin")
payment_staff = require_roles("order_manager", "super_admin")


@router.get("/gateways")
def list_gateways(db: Session = Depends(get_db)) -> dict:
    return success_response(data=db.query(PaymentGateway).filter(PaymentGateway.is_active.is_(True), PaymentGateway.is_deleted.is_(False)).all())


@router.post("/gateways", status_code=201)
def create_gateway(payload: PaymentGatewayCreate, request: Request, db: Session = Depends(get_db), actor: User = Depends(super_admin)) -> dict:
    gateway = PaymentGateway(**payload.model_dump())
    db.add(gateway)
    db.flush()
    log_action(db, actor=actor, table_name="payment_gateways", record_id=str(gateway.id), action=AuditAction.create, after_data=model_to_dict(gateway), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(gateway)
    return success_response("Payment gateway created", gateway)


@router.put("/gateways/{gateway_id}")
def update_gateway(gateway_id: uuid.UUID, payload: PaymentGatewayUpdate, request: Request, db: Session = Depends(get_db), actor: User = Depends(super_admin)) -> dict:
    gateway = db.get(PaymentGateway, gateway_id)
    if not gateway or gateway.is_deleted:
        raise HTTPException(status_code=404, detail="Payment gateway not found")
    before = model_to_dict(gateway)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(gateway, field, value)
    db.flush()
    log_action(db, actor=actor, table_name="payment_gateways", record_id=str(gateway.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(gateway), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(gateway)
    return success_response("Payment gateway updated", gateway)


@router.delete("/gateways/{gateway_id}")
def delete_gateway(gateway_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(super_admin)) -> dict:
    gateway = db.get(PaymentGateway, gateway_id)
    if not gateway or gateway.is_deleted:
        raise HTTPException(status_code=404, detail="Payment gateway not found")
    before = model_to_dict(gateway)
    gateway.soft_delete()
    db.flush()
    log_action(db, actor=actor, table_name="payment_gateways", record_id=str(gateway.id), action=AuditAction.delete, before_data=before, after_data=model_to_dict(gateway), ip_address=request.client.host if request.client else None)
    db.commit()
    return success_response("Payment gateway deleted", {"id": gateway_id})


@router.post("", status_code=201)
def create_payment(payload: PaymentCreate, request: Request, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> dict:
    order = db.get(Order, payload.order_id)
    gateway = db.get(PaymentGateway, payload.gateway_id)
    if not order or order.is_deleted:
        raise HTTPException(status_code=404, detail="Order not found")
    if not gateway or gateway.is_deleted or not gateway.is_active:
        raise HTTPException(status_code=404, detail="Payment gateway not available")
    if role_name(user) == "customer" and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    payment = Payment(**payload.model_dump())
    db.add(payment)
    db.flush()
    log_action(db, actor=user, table_name="payments", record_id=str(payment.id), action=AuditAction.create, after_data=model_to_dict(payment), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(payment)
    return success_response("Payment created", payment)


@router.patch("/{payment_id}/status")
def update_payment_status(payment_id: uuid.UUID, payload: PaymentStatusUpdate, request: Request, db: Session = Depends(get_db), actor: User = Depends(payment_staff)) -> dict:
    payment = db.get(Payment, payment_id)
    if not payment or payment.is_deleted:
        raise HTTPException(status_code=404, detail="Payment not found")
    before = model_to_dict(payment)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(payment, field, value)
    db.flush()
    log_action(db, actor=actor, table_name="payments", record_id=str(payment.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(payment), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(payment)
    return success_response("Payment status updated", payment)
