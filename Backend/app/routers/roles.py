import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.enums import AuditAction
from app.core.permissions import require_roles
from app.database import get_db
from app.models.role import Role
from app.models.user import User
from app.schemas.role import RoleCreate, RoleUpdate
from app.services.audit import log_action, model_to_dict
from app.utils.response import success_response

router = APIRouter(prefix="/roles", tags=["roles"])
super_admin = require_roles("super_admin")


@router.get("")
def list_roles(include_deleted: bool = False, db: Session = Depends(get_db), _: User = Depends(super_admin)) -> dict:
    query = db.query(Role)
    if not include_deleted:
        query = query.filter(Role.is_deleted.is_(False))
    return success_response(data=query.order_by(Role.name).all())


@router.get("/{role_id}")
def get_role(role_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(super_admin)) -> dict:
    role = db.get(Role, role_id)
    if not role or role.is_deleted:
        raise HTTPException(status_code=404, detail="Role not found")
    return success_response(data=role)


@router.post("", status_code=201)
def create_role(payload: RoleCreate, request: Request, db: Session = Depends(get_db), actor: User = Depends(super_admin)) -> dict:
    role = Role(**payload.model_dump())
    db.add(role)
    db.flush()
    log_action(db, actor=actor, table_name="roles", record_id=str(role.id), action=AuditAction.create, after_data=model_to_dict(role), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(role)
    return success_response("Role created", role)


@router.put("/{role_id}")
def update_role(role_id: uuid.UUID, payload: RoleUpdate, request: Request, db: Session = Depends(get_db), actor: User = Depends(super_admin)) -> dict:
    role = db.get(Role, role_id)
    if not role or role.is_deleted:
        raise HTTPException(status_code=404, detail="Role not found")
    before = model_to_dict(role)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(role, field, value)
    db.flush()
    log_action(db, actor=actor, table_name="roles", record_id=str(role.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(role), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(role)
    return success_response("Role updated", role)


@router.delete("/{role_id}", status_code=200)
def delete_role(role_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(super_admin)) -> dict:
    role = db.get(Role, role_id)
    if not role or role.is_deleted:
        raise HTTPException(status_code=404, detail="Role not found")
    before = model_to_dict(role)
    role.soft_delete()
    db.flush()
    log_action(db, actor=actor, table_name="roles", record_id=str(role.id), action=AuditAction.delete, before_data=before, after_data=model_to_dict(role), ip_address=request.client.host if request.client else None)
    db.commit()
    return success_response("Role deleted", {"id": role_id})


@router.patch("/{role_id}/restore")
def restore_role(role_id: uuid.UUID, request: Request, db: Session = Depends(get_db), actor: User = Depends(super_admin)) -> dict:
    role = db.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    before = model_to_dict(role)
    role.restore()
    db.flush()
    log_action(db, actor=actor, table_name="roles", record_id=str(role.id), action=AuditAction.update, before_data=before, after_data=model_to_dict(role), ip_address=request.client.host if request.client else None)
    db.commit()
    db.refresh(role)
    return success_response("Role restored", role)
