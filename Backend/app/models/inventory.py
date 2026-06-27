import uuid
from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class InventoryItem(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "inventory_items"

    name: Mapped[str] = mapped_column(String(180), index=True)
    sku: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    unit: Mapped[str] = mapped_column(String(40), nullable=False)
    quantity_on_hand: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=0)
    reorder_threshold: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    menu_mappings = relationship(
        "MenuItemInventory",
        back_populates="inventory_item",
        cascade="all, delete-orphan",
    )


class MenuItemInventory(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "menu_item_inventory"
    __table_args__ = (
        UniqueConstraint(
            "menu_item_id", "inventory_item_id", name="uq_menu_item_inventory"
        ),
    )

    menu_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("menu_items.id"), index=True
    )
    inventory_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("inventory_items.id"), index=True
    )
    quantity_required: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)

    menu_item = relationship("MenuItem", back_populates="inventory_mappings")
    inventory_item = relationship("InventoryItem", back_populates="menu_mappings")
