import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.enums import AuditAction
from app.core.permissions import require_roles
from app.database import get_db
from app.models.deal import Deal, DealItem
from app.models.menu import MenuItem
from app.models.user import User
from app.schemas.deal import DealItemCreate, DealItemUpdate
from app.services.audit import log_action, model_to_dict
from app.utils.response import success_response

router = APIRouter(prefix="/deal-items", tags=["deal-items"])
content_admin = require_roles("content_admin", "super_admin")


@router.get("")
def list_deal_items(include_deleted: bool = False, db: Session = Depends(get_db), _: User = Depends(content_admin)) -> dict:
    query = db.query(DealItem)
    if not include_deleted:
        query = query.filter(DealItem.is_deleted.is_(False))
    return success_response(data=query.all())


@router.get("/deal/{deal_id}")
def list_deal_items_for_deal(deal_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    return success_response(data=db.query(DealItem).filter(DealItem.deal_id == deal_id, DealItem.is_deleted.is_(False)).all())


@router.get("/{deal_item_id}")
def get_deal_item(deal_item_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(content_admin)) -> dict:
    item = db.get(DealItem, deal_item_id)
    if not item or item.is_deleted:
        raise HTTPException(status_code=404, detail="Deal item not found")
    return success_response(data=item)


@router.post("", status_code=201)
def create_deal_item(payload: DealItemCreate, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    deal = db.get(Deal, payload.deal_id)
    menu_item = db.get(MenuItem, payload.menu_item_id)
    if not deal or deal.is_deleted:
        raise HTTPException(status_code=404, detail="Deal not found")
    if not menu_item or menu_item.is_deleted:
        raise HTTPException(status_code=404, detail="Menu item not found")
    item = DealItem(**payload.model_dump())
    db.add(item)
    db.flush()
    log_action(db, actor=actor, table_name="deal_items", record_id=str(item.id), action=AuditAction.create, after_data=model_to_dict(item), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(item)
    return success_response("Deal item created", item)


@router.put("/{deal_item_id}")
def update_deal_item(deal_item_id: uuid.UUID, payload: DealItemUpdate, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    item = db.get(DealItem, deal_item_id)
    if not item or item.is_deleted:
        raise HTTPException(status_code=404, detail="Deal item not found")
    before = model_to_dict(item)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.flush()
    log_action(db, actor=actor, table_name="deal_items", record_id=str(item.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(item), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(item)
    return success_response("Deal item updated", item)


@router.delete("/{deal_item_id}")
def delete_deal_item(deal_item_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    item = db.get(DealItem, deal_item_id)
    if not item or item.is_deleted:
        raise HTTPException(status_code=404, detail="Deal item not found")
    before = model_to_dict(item)
    item.soft_delete()
    db.flush()
    log_action(db, actor=actor, table_name="deal_items", record_id=str(item.id), action=AuditAction.delete, before_data=before, after_data=model_to_dict(item), ip_address=request.client.host if request.client else None)
    db.commit()
    return success_response("Deal item deleted", {"id": deal_item_id})


@router.patch("/{deal_item_id}/restore")
def restore_deal_item(deal_item_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    item = db.get(DealItem, deal_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Deal item not found")
    before = model_to_dict(item)
    item.restore()
    db.flush()
    log_action(db, actor=actor, table_name="deal_items", record_id=str(item.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(item), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(item)
    return success_response("Deal item restored", item)
