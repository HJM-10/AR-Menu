import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, selectinload

from app.core.enums import AuditAction
from app.core.permissions import require_roles
from app.database import get_db
from app.models.deal import Deal
from app.models.user import User
from app.schemas.deal import DealCreate, DealUpdate
from app.services.audit import log_action, model_to_dict
from app.utils.response import success_response

router = APIRouter(prefix="/deals", tags=["deals"])
content_admin = require_roles("content_admin", "super_admin")


def active_deals_query(db: Session):
    now = datetime.now(timezone.utc)
    return (
        db.query(Deal)
        .options(selectinload(Deal.deal_items))
        .filter(
            Deal.is_deleted.is_(False),
            Deal.is_active.is_(True),
            (Deal.starts_at.is_(None)) | (Deal.starts_at <= now),
            (Deal.ends_at.is_(None)) | (Deal.ends_at >= now),
        )
    )


@router.get("")
def list_deals(db: Session = Depends(get_db)) -> dict:
    return success_response(data=active_deals_query(db).order_by(Deal.name).all())


@router.get("/admin/all")
def admin_list_deals(include_deleted: bool = False, db: Session = Depends(get_db), _: User = Depends(content_admin)) -> dict:
    query = db.query(Deal).options(selectinload(Deal.deal_items))
    if not include_deleted:
        query = query.filter(Deal.is_deleted.is_(False))
    return success_response(data=query.order_by(Deal.name).all())


@router.get("/{deal_id}")
def get_deal(deal_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    deal = active_deals_query(db).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return success_response(data=deal)


@router.post("", status_code=201)
def create_deal(payload: DealCreate, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    deal = Deal(**payload.model_dump())
    db.add(deal)
    db.flush()
    log_action(db, actor=actor, table_name="deals", record_id=str(deal.id), action=AuditAction.create, after_data=model_to_dict(deal), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(deal)
    return success_response("Deal created", deal)


@router.put("/{deal_id}")
def update_deal(deal_id: uuid.UUID, payload: DealUpdate, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    deal = db.get(Deal, deal_id)
    if not deal or deal.is_deleted:
        raise HTTPException(status_code=404, detail="Deal not found")
    before = model_to_dict(deal)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(deal, field, value)
    db.flush()
    log_action(db, actor=actor, table_name="deals", record_id=str(deal.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(deal), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(deal)
    return success_response("Deal updated", deal)


@router.delete("/{deal_id}")
def delete_deal(deal_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    deal = db.get(Deal, deal_id)
    if not deal or deal.is_deleted:
        raise HTTPException(status_code=404, detail="Deal not found")
    before = model_to_dict(deal)
    deal.soft_delete()
    db.flush()
    log_action(db, actor=actor, table_name="deals", record_id=str(deal.id), action=AuditAction.delete, before_data=before, after_data=model_to_dict(deal), ip_address=request.client.host if request.client else None)
    db.commit()
    return success_response("Deal deleted", {"id": deal_id})


@router.patch("/{deal_id}/restore")
def restore_deal(deal_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    deal = db.get(Deal, deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    before = model_to_dict(deal)
    deal.restore()
    db.flush()
    log_action(db, actor=actor, table_name="deals", record_id=str(deal.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(deal), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(deal)
    return success_response("Deal restored", deal)
