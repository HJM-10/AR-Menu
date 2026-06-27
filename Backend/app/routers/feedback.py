import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.auth.dependencies import get_optional_current_user
from app.core.enums import AuditAction
from app.core.permissions import require_roles
from app.database import get_db
from app.models.feedback import Feedback
from app.models.user import User
from app.schemas.feedback import FeedbackCreate
from app.services.audit import log_action, model_to_dict
from app.utils.response import success_response

router = APIRouter(prefix="/feedback", tags=["feedback"])
content_admin = require_roles("content_admin", "super_admin")


@router.post("", status_code=201)
def create_feedback(payload: FeedbackCreate, request: Request, db: Session = Depends(get_db), user: User | None = Depends(get_optional_current_user)) -> dict:
    feedback = Feedback(**payload.model_dump(), user_id=user.id if user else None)
    db.add(feedback)
    db.flush()
    log_action(db, actor=user, table_name="feedback", record_id=str(feedback.id), action=AuditAction.create, after_data=model_to_dict(feedback), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(feedback)
    return success_response("Feedback submitted", feedback)


@router.get("/admin/all")
def list_feedback(include_deleted: bool = False, db: Session = Depends(get_db), _: User = Depends(content_admin)) -> dict:
    query = db.query(Feedback)
    if not include_deleted:
        query = query.filter(Feedback.is_deleted.is_(False))
    return success_response(data=query.order_by(Feedback.created_at.desc()).all())


@router.delete("/{feedback_id}")
def delete_feedback(feedback_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    feedback = db.get(Feedback, feedback_id)
    if not feedback or feedback.is_deleted:
        raise HTTPException(status_code=404, detail="Feedback not found")
    before = model_to_dict(feedback)
    feedback.soft_delete()
    db.flush()
    log_action(db, actor=actor, table_name="feedback", record_id=str(feedback.id), action=AuditAction.delete, before_data=before, after_data=model_to_dict(feedback), ip_address=request.client.host if request.client else None)
    db.commit()
    return success_response("Feedback deleted", {"id": feedback_id})


@router.patch("/{feedback_id}/restore")
def restore_feedback(feedback_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(content_admin)) -> dict:
    feedback = db.get(Feedback, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    before = model_to_dict(feedback)
    feedback.restore()
    db.flush()
    log_action(db, actor=actor, table_name="feedback", record_id=str(feedback.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(feedback), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(feedback)
    return success_response("Feedback restored", feedback)
