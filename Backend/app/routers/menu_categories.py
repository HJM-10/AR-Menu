import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.enums import AuditAction
from app.core.permissions import require_roles
from app.database import get_db
from app.models.menu import MenuCategory
from app.models.user import User
from app.schemas.menu import MenuCategoryCreate, MenuCategoryUpdate
from app.services.audit import log_action, model_to_dict
from app.utils.response import success_response

router = APIRouter(prefix="/categories", tags=["categories"])
content_admin = require_roles("content_admin", "super_admin")


@router.get("")
def list_categories(db: Session = Depends(get_db)) -> dict:
    rows = (
        db.query(MenuCategory)
        .filter(MenuCategory.is_deleted.is_(False), MenuCategory.is_active.is_(True))
        .order_by(MenuCategory.display_order, MenuCategory.name)
        .all()
    )
    return success_response(data=rows)


@router.get("/admin/all")
def admin_list_categories(include_deleted: bool = False, db: Session = Depends(get_db), _: User = Depends(content_admin)) -> dict:
    query = db.query(MenuCategory)
    if not include_deleted:
        query = query.filter(MenuCategory.is_deleted.is_(False))
    return success_response(data=query.order_by(MenuCategory.display_order, MenuCategory.name).all())


@router.get("/{category_id}")
def get_category(category_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    category = db.get(MenuCategory, category_id)
    if not category or category.is_deleted or not category.is_active:
        raise HTTPException(status_code=404, detail="Category not found")
    return success_response(data=category)


@router.post("", status_code=201)
def create_category(payload: MenuCategoryCreate, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    category = MenuCategory(**payload.model_dump())
    db.add(category)
    db.flush()
    log_action(db, actor=actor, table_name="menu_categories", record_id=str(category.id), action=AuditAction.create, after_data=model_to_dict(category), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(category)
    return success_response("Category created", category)


@router.put("/{category_id}")
def update_category(category_id: uuid.UUID, payload: MenuCategoryUpdate, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    category = db.get(MenuCategory, category_id)
    if not category or category.is_deleted:
        raise HTTPException(status_code=404, detail="Category not found")
    before = model_to_dict(category)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    db.flush()
    log_action(db, actor=actor, table_name="menu_categories", record_id=str(category.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(category), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(category)
    return success_response("Category updated", category)


@router.delete("/{category_id}")
def delete_category(category_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    category = db.get(MenuCategory, category_id)
    if not category or category.is_deleted:
        raise HTTPException(status_code=404, detail="Category not found")
    before = model_to_dict(category)
    category.soft_delete()
    db.flush()
    log_action(db, actor=actor, table_name="menu_categories", record_id=str(category.id), action=AuditAction.delete, before_data=before, after_data=model_to_dict(category), ip_address=request.client.host if request.client else None)
    db.commit()
    return success_response("Category deleted", {"id": category_id})


@router.patch("/{category_id}/restore")
def restore_category(category_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    category = db.get(MenuCategory, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    before = model_to_dict(category)
    category.restore()
    db.flush()
    log_action(db, actor=actor, table_name="menu_categories", record_id=str(category.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(category), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(category)
    return success_response("Category restored", category)
