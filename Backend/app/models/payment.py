import uuid
from decimal import Decimal

from sqlalchemy import Boolean, Enum, ForeignKey, JSON, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import PaymentStatus
from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin, enum_values


class PaymentGateway(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "payment_gateways"

    name: Mapped[str] = mapped_column(String(120), unique=True)
    code: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    config: Mapped[dict | None] = mapped_column(JSON)

    payments = relationship("Payment", back_populates="gateway")


class Payment(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "payments"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id"), index=True
    )
    gateway_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("payment_gateways.id"), index=True
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, values_callable=enum_values, name="payment_status"),
        default=PaymentStatus.pending,
        nullable=False,
    )
    gateway_payment_id: Mapped[str | None] = mapped_column(String(255), index=True)
    payment_method: Mapped[str | None] = mapped_column(String(50))
    raw_response: Mapped[dict | None] = mapped_column(JSON)

    order = relationship("Order", back_populates="payments")
    gateway = relationship("PaymentGateway", back_populates="payments")
