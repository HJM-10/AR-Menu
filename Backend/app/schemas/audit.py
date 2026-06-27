import uuid

from app.core.enums import AuditAction
from app.schemas.common import IDModel


class AuditLogRead(IDModel):
    id: uuid.UUID
    actor_user_id: uuid.UUID | None
    table_name: str
    record_id: str
    action: AuditAction
    before_data: dict | None
    after_data: dict | None
    ip_address: str | None
