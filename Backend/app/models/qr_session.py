import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import QRSessionStatus
from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin, enum_values


class QRSession(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "qr_sessions"

    table_number: Mapped[str] = mapped_column(String(40), index=True)
    session_token: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, default=lambda: uuid.uuid4().hex
    )
    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    status: Mapped[QRSessionStatus] = mapped_column(
        Enum(QRSessionStatus, values_callable=enum_values, name="qr_session_status"),
        default=QRSessionStatus.active,
        nullable=False,
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    device_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    customer = relationship("User", back_populates="qr_sessions")
    carts = relationship("Cart", back_populates="qr_session")
    orders = relationship("Order", back_populates="qr_session")
