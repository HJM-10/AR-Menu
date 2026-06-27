import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_active_user
from app.core.enums import AuditAction
from app.core.permissions import require_roles, role_name
from app.database import get_db
from app.models.role import Role
from app.models.user import User
from app.schemas.user import AdminUserCreate, UserRoleUpdate, UserUpdate
from app.core.security import get_password_hash
from app.services.audit import log_action, model_to_dict
from app.utils.response import success_response

router = APIRouter(prefix="/users", tags=["users"])
super_admin = require_roles("super_admin")


@router.get("")
def list_users(include_deleted: bool = False, db: Session = Depends(get_db), _: User = Depends(super_admin)) -> dict:
    query = db.query(User).options(joinedload(User.role))
    if not include_deleted:
        query = query.filter(User.is_deleted.is_(False))
    return success_response(data=query.order_by(User.created_at.desc()).all())


@router.get("/{user_id}")
def get_user(user_id: uuid.UUID, db: Session = Depends(get_db), current: User = Depends(get_current_active_user)) -> dict:
    if current.id != user_id and role_name(current) != "super_admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    user = db.query(User).options(joinedload(User.role)).filter(User.id == user_id).first()
    if not user or user.is_deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return success_response(data=user)


@router.post("", status_code=201)
def create_user(payload: AdminUserCreate, request: Request, db: Session = Depends(get_db), actor: User = Depends(super_admin)) -> dict:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    role = db.query(Role).filter(Role.name == payload.role_name, Role.is_deleted.is_(False)).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    user = User(email=payload.email, full_name=payload.full_name, phone=payload.phone, password_hash=get_password_hash(payload.password), role_id=role.id, is_active=payload.is_active)
    db.add(user)
    db.flush()
    log_action(db, actor=actor, table_name="users", record_id=str(user.id), action=AuditAction.create, after_data=model_to_dict(user), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(user)
    return success_response("User created", user)


@router.put("/{user_id}")
def update_user(user_id: uuid.UUID, payload: UserUpdate, request: Request, db: Session = Depends(get_db), current: User = Depends(get_current_active_user)) -> dict:
    if current.id != user_id and role_name(current) != "super_admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    user = db.get(User, user_id)
    if not user or user.is_deleted:
        raise HTTPException(status_code=404, detail="User not found")
    before = model_to_dict(user)
    update_data = payload.model_dump(exclude_unset=True)
    if role_name(current) != "super_admin":
        update_data.pop("is_active", None)
    for field, value in update_data.items():
        setattr(user, field, value)
    db.flush()
    log_action(db, actor=current, table_name="users", record_id=str(user.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(user), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(user)
    return success_response("User updated", user)


@router.patch("/{user_id}/role")
def change_user_role(user_id: uuid.UUID, payload: UserRoleUpdate, request: Request, db: Session = Depends(get_db), actor: User = Depends(super_admin)) -> dict:
    user = db.get(User, user_id)
    if not user or user.is_deleted:
        raise HTTPException(status_code=404, detail="User not found")
    role = db.get(Role, payload.role_id) if payload.role_id else db.query(Role).filter(Role.name == payload.role_name).first()
    if not role or role.is_deleted:
        raise HTTPException(status_code=404, detail="Role not found")
    before = model_to_dict(user)
    user.role_id = role.id
    db.flush()
    log_action(db, actor=actor, table_name="users", record_id=str(user.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(user), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(user)
    return success_response("User role updated", user)


@router.delete("/{user_id}")
def delete_user(user_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(super_admin)) -> dict:
    user = db.get(User, user_id)
    if not user or user.is_deleted:
        raise HTTPException(status_code=404, detail="User not found")
    before = model_to_dict(user)
    user.soft_delete()
    db.flush()
    log_action(db, actor=actor, table_name="users", record_id=str(user.id), action=AuditAction.delete, before_data=before, after_data=model_to_dict(user), ip_address=request.client.host if request.client else None)
    db.commit()
    return success_response("User deleted", {"id": user_id})


@router.patch("/{user_id}/restore")
def restore_user(user_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(super_admin)) -> dict:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    before = model_to_dict(user)
    user.restore()
    db.flush()
    log_action(db, actor=actor, table_name="users", record_id=str(user.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(user), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(user)
    return success_response("User restored", user)
