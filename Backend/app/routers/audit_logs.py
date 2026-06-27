from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.database import get_db
from app.models.audit import AuditLog
from app.models.user import User
from app.utils.response import success_response

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])
super_admin = require_roles("super_admin")


@router.get("")
def list_audit_logs(table_name: str | None = None, db: Session = Depends(get_db), _: User = Depends(super_admin)) -> dict:
    query = db.query(AuditLog).filter(AuditLog.is_deleted.is_(False))
    if table_name:
        query = query.filter(AuditLog.table_name == table_name)
    return success_response(data=query.order_by(AuditLog.created_at.desc()).limit(500).all())
