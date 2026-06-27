import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.enums import AuditAction
from app.core.permissions import require_roles
from app.database import get_db
from app.models.inventory import InventoryItem, MenuItemInventory
from app.models.menu import MenuItem
from app.models.user import User
from app.schemas.inventory import InventoryItemCreate, InventoryItemUpdate, MenuItemInventoryCreate
from app.services.audit import log_action, model_to_dict
from app.utils.response import success_response

router = APIRouter(prefix="/inventory", tags=["inventory"])
inventory_admin = require_roles("content_admin", "order_manager", "super_admin")


@router.get("/items")
def list_inventory(include_deleted: bool = False, db: Session = Depends(get_db), _: User = Depends(inventory_admin)) -> dict:
    query = db.query(InventoryItem)
    if not include_deleted:
        query = query.filter(InventoryItem.is_deleted.is_(False))
    return success_response(data=query.order_by(InventoryItem.name).all())


@router.post("/items", status_code=201)
def create_inventory_item(payload: InventoryItemCreate, request: Request, db: Session = Depends(get_db), actor: User = Depends(inventory_admin)) -> dict:
    item = InventoryItem(**payload.model_dump())
    db.add(item)
    db.flush()
    log_action(db, actor=actor, table_name="inventory_items", record_id=str(item.id), action=AuditAction.create, after_data=model_to_dict(item), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(item)
    return success_response("Inventory item created", item)


@router.put("/items/{item_id}")
def update_inventory_item(item_id: uuid.UUID, payload: InventoryItemUpdate, request: Request, db: Session = Depends(get_db), actor: User = Depends(inventory_admin)) -> dict:
    item = db.get(InventoryItem, item_id)
    if not item or item.is_deleted:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    before = model_to_dict(item)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.flush()
    log_action(db, actor=actor, table_name="inventory_items", record_id=str(item.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(item), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(item)
    return success_response("Inventory item updated", item)


@router.delete("/items/{item_id}")
def delete_inventory_item(item_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(inventory_admin)) -> dict:
    item = db.get(InventoryItem, item_id)
    if not item or item.is_deleted:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    before = model_to_dict(item)
    item.soft_delete()
    db.flush()
    log_action(db, actor=actor, table_name="inventory_items", record_id=str(item.id), action=AuditAction.delete, before_data=before, after_data=model_to_dict(item), ip_address=request.client.host if request.client else None)
    db.commit()
    return success_response("Inventory item deleted", {"id": item_id})


@router.patch("/items/{item_id}/restore")
def restore_inventory_item(item_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(inventory_admin)) -> dict:
    item = db.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    before = model_to_dict(item)
    item.restore()
    db.flush()
    log_action(db, actor=actor, table_name="inventory_items", record_id=str(item.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(item), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(item)
    return success_response("Inventory item restored", item)


@router.post("/menu-mappings", status_code=201)
def create_menu_inventory_mapping(payload: MenuItemInventoryCreate, request: Request, db: Session = Depends(get_db), actor: User = Depends(inventory_admin)) -> dict:
    if not db.get(MenuItem, payload.menu_item_id):
        raise HTTPException(status_code=404, detail="Menu item not found")
    if not db.get(InventoryItem, payload.inventory_item_id):
        raise HTTPException(status_code=404, detail="Inventory item not found")
    mapping = MenuItemInventory(**payload.model_dump())
    db.add(mapping)
    db.flush()
    log_action(db, actor=actor, table_name="menu_item_inventory", record_id=str(mapping.id), action=AuditAction.create, after_data=model_to_dict(mapping), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(mapping)
    return success_response("Inventory mapping created", mapping)


@router.delete("/menu-mappings/{mapping_id}")
def delete_menu_inventory_mapping(mapping_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(inventory_admin)) -> dict:
    mapping = db.get(MenuItemInventory, mapping_id)
    if not mapping or mapping.is_deleted:
        raise HTTPException(status_code=404, detail="Inventory mapping not found")
    before = model_to_dict(mapping)
    mapping.soft_delete()
    db.flush()
    log_action(db, actor=actor, table_name="menu_item_inventory", record_id=str(mapping.id), action=AuditAction.delete, before_data=before, after_data=model_to_dict(mapping), ip_address=request.client.host if request.client else None)
    db.commit()
    return success_response("Inventory mapping deleted", {"id": mapping_id})
