from typing import Any

from fastapi.encoders import jsonable_encoder
from sqlalchemy import inspect
from sqlalchemy.orm import Session

from app.core.enums import AuditAction
from app.models.audit import AuditLog
from app.models.user import User


def model_to_dict(model: Any) -> dict:
    mapper = inspect(model).mapper
    return {
        column.key: jsonable_encoder(getattr(model, column.key))
        for column in mapper.column_attrs
    }


def log_action(
    db: Session,
    *,
    actor: User | None,
    table_name: str,
    record_id: str,
    action: AuditAction,
    before_data: dict | None = None,
    after_data: dict | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    log = AuditLog(
        actor_user_id=actor.id if actor else None,
        table_name=table_name,
        record_id=record_id,
        action=action,
        before_data=before_data,
        after_data=after_data,
        ip_address=ip_address,
    )
    db.add(log)
    return log
