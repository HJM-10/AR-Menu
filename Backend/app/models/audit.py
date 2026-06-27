import uuid

from sqlalchemy import Enum, ForeignKey, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import AuditAction
from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin, enum_values


class AuditLog(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "audit_logs"

    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True
    )
    table_name: Mapped[str] = mapped_column(String(120), index=True)
    record_id: Mapped[str] = mapped_column(String(80), index=True)
    action: Mapped[AuditAction] = mapped_column(
        Enum(AuditAction, values_callable=enum_values, name="audit_action"),
        nullable=False,
    )
    before_data: Mapped[dict | None] = mapped_column(JSON)
    after_data: Mapped[dict | None] = mapped_column(JSON)
    ip_address: Mapped[str | None] = mapped_column(String(64))

    actor = relationship("User")
