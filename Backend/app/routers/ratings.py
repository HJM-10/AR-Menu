import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_active_user
from app.core.enums import AuditAction
from app.core.permissions import require_roles
from app.database import get_db
from app.models.menu import MenuItem
from app.models.rating import Rating
from app.models.user import User
from app.schemas.rating import RatingCreate
from app.services.audit import log_action, model_to_dict
from app.services.rating_service import recalculate_menu_item_rating
from app.utils.response import success_response

router = APIRouter(prefix="/ratings", tags=["ratings"])
content_admin = require_roles("content_admin", "super_admin")


@router.post("", status_code=201)
def create_rating(payload: RatingCreate, request: Request, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> dict:
    menu_item = db.get(MenuItem, payload.menu_item_id)
    if not menu_item or menu_item.is_deleted:
        raise HTTPException(status_code=404, detail="Menu item not found")
    rating = Rating(**payload.model_dump(), user_id=user.id)
    db.add(rating)
    db.flush()
    recalculate_menu_item_rating(db, payload.menu_item_id)
    log_action(db, actor=user, table_name="ratings", record_id=str(rating.id), action=AuditAction.create, after_data=model_to_dict(rating), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(rating)
    return success_response("Rating created", rating)


@router.get("/menu-item/{menu_item_id}")
def list_ratings_for_menu_item(menu_item_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    rows = (
        db.query(Rating)
        .filter(Rating.menu_item_id == menu_item_id, Rating.is_deleted.is_(False))
        .order_by(Rating.created_at.desc())
        .all()
    )
    return success_response(data=rows)


@router.get("/admin/all")
def admin_list_ratings(include_deleted: bool = False, db: Session = Depends(get_db), _: User = Depends(content_admin)) -> dict:
    query = db.query(Rating)
    if not include_deleted:
        query = query.filter(Rating.is_deleted.is_(False))
    return success_response(data=query.order_by(Rating.created_at.desc()).all())


@router.delete("/{rating_id}")
def delete_rating(rating_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    rating = db.get(Rating, rating_id)
    if not rating or rating.is_deleted:
        raise HTTPException(status_code=404, detail="Rating not found")
    before = model_to_dict(rating)
    rating.soft_delete()
    db.flush()
    recalculate_menu_item_rating(db, rating.menu_item_id)
    log_action(db, actor=actor, table_name="ratings", record_id=str(rating.id), action=AuditAction.delete, before_data=before, after_data=model_to_dict(rating), ip_address=request.client.host if request.client else None)
    db.commit()
    return success_response("Rating deleted", {"id": rating_id})


@router.patch("/{rating_id}/restore")
def restore_rating(rating_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    rating = db.get(Rating, rating_id)
    if not rating:
        raise HTTPException(status_code=404, detail="Rating not found")
    before = model_to_dict(rating)
    rating.restore()
    db.flush()
    recalculate_menu_item_rating(db, rating.menu_item_id)
    log_action(db, actor=actor, table_name="ratings", record_id=str(rating.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(rating), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(rating)
    return success_response("Rating restored", rating)
