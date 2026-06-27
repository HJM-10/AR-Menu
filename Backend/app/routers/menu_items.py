import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload

from app.core.enums import AuditAction
from app.core.permissions import require_roles
from app.database import get_db
from app.models.menu import MenuCategory, MenuItem
from app.models.user import User
from app.schemas.menu import MenuItemAvailabilityUpdate, MenuItemCreate, MenuItemUpdate
from app.services.audit import log_action, model_to_dict
from app.utils.response import success_response

router = APIRouter(prefix="/menu-items", tags=["menu-items"])
content_admin = require_roles("content_admin", "super_admin")


def public_menu_query(db: Session):
    return (
        db.query(MenuItem)
        .join(MenuItem.category)
        .options(joinedload(MenuItem.category))
        .filter(
            MenuItem.is_deleted.is_(False),
            MenuItem.is_available.is_(True),
            MenuCategory.is_deleted.is_(False),
            MenuCategory.is_active.is_(True),
        )
    )


@router.get("")
def list_menu_items(db: Session = Depends(get_db)) -> dict:
    return success_response(data=public_menu_query(db).order_by(MenuItem.name).all())


@router.get("/admin/all")
def admin_list_menu_items(include_deleted: bool = False, db: Session = Depends(get_db), _: User = Depends(content_admin)) -> dict:
    query = db.query(MenuItem).options(joinedload(MenuItem.category))
    if not include_deleted:
        query = query.filter(MenuItem.is_deleted.is_(False))
    return success_response(data=query.order_by(MenuItem.name).all())


@router.get("/category/{category_id}")
def list_menu_items_by_category(category_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    return success_response(data=public_menu_query(db).filter(MenuItem.category_id == category_id).order_by(MenuItem.name).all())


@router.get("/{item_id}")
def get_menu_item(item_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    item = public_menu_query(db).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return success_response(data=item)


@router.post("", status_code=201)
def create_menu_item(payload: MenuItemCreate, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    category = db.get(MenuCategory, payload.category_id)
    if not category or category.is_deleted:
        raise HTTPException(status_code=404, detail="Category not found")
    item = MenuItem(**payload.model_dump())
    db.add(item)
    db.flush()
    log_action(db, actor=actor, table_name="menu_items", record_id=str(item.id), action=AuditAction.create, after_data=model_to_dict(item), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(item)
    return success_response("Menu item created", item)


@router.put("/{item_id}")
def update_menu_item(item_id: uuid.UUID, payload: MenuItemUpdate, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    item = db.get(MenuItem, item_id)
    if not item or item.is_deleted:
        raise HTTPException(status_code=404, detail="Menu item not found")
    before = model_to_dict(item)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.flush()
    log_action(db, actor=actor, table_name="menu_items", record_id=str(item.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(item), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(item)
    return success_response("Menu item updated", item)


@router.patch("/{item_id}/availability")
def update_availability(item_id: uuid.UUID, payload: MenuItemAvailabilityUpdate, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    item = db.get(MenuItem, item_id)
    if not item or item.is_deleted:
        raise HTTPException(status_code=404, detail="Menu item not found")
    before = model_to_dict(item)
    item.is_available = payload.is_available
    db.flush()
    log_action(db, actor=actor, table_name="menu_items", record_id=str(item.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(item), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(item)
    return success_response("Menu item availability updated", item)


@router.delete("/{item_id}")
def delete_menu_item(item_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    item = db.get(MenuItem, item_id)
    if not item or item.is_deleted:
        raise HTTPException(status_code=404, detail="Menu item not found")
    before = model_to_dict(item)
    item.soft_delete()
    db.flush()
    log_action(db, actor=actor, table_name="menu_items", record_id=str(item.id), action=AuditAction.delete, before_data=before, after_data=model_to_dict(item), ip_address=request.client.host if request.client else None)
    db.commit()
    return success_response("Menu item deleted", {"id": item_id})


@router.patch("/{item_id}/restore")
def restore_menu_item(item_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    item = db.get(MenuItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    before = model_to_dict(item)
    item.restore()
    db.flush()
    log_action(db, actor=actor, table_name="menu_items", record_id=str(item.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(item), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(item)
    return success_response("Menu item restored", item)
