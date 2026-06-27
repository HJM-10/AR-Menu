import uuid
from decimal import Decimal

from sqlalchemy import CheckConstraint, Enum, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import CartStatus
from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin, enum_values


class Cart(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "carts"

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True
    )
    qr_session_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("qr_sessions.id"), nullable=True, index=True
    )
    table_number: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[CartStatus] = mapped_column(
        Enum(CartStatus, values_callable=enum_values, name="cart_status"),
        default=CartStatus.active,
        nullable=False,
    )

    user = relationship("User", back_populates="carts")
    qr_session = relationship("QRSession", back_populates="carts")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "cart_items"
    __table_args__ = (
        UniqueConstraint("cart_id", "menu_item_id", "deal_id", name="uq_cart_item_target"),
        CheckConstraint(
            "(menu_item_id IS NOT NULL AND deal_id IS NULL) OR "
            "(menu_item_id IS NULL AND deal_id IS NOT NULL)",
            name="ck_cart_item_one_target",
        ),
    )

    cart_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("carts.id"), index=True
    )
    menu_item_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("menu_items.id"), nullable=True, index=True
    )
    deal_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("deals.id"), nullable=True, index=True
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    cart = relationship("Cart", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="cart_items")
    deal = relationship("Deal", back_populates="cart_items")
