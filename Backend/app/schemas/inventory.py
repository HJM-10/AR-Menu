import uuid
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import IDModel


class InventoryItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    sku: str = Field(min_length=1, max_length=80)
    unit: str = Field(min_length=1, max_length=40)
    quantity_on_hand: Decimal = Field(default=Decimal("0"), ge=0)
    reorder_threshold: Decimal = Field(default=Decimal("0"), ge=0)
    is_active: bool = True


class InventoryItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=180)
    sku: str | None = Field(default=None, min_length=1, max_length=80)
    unit: str | None = Field(default=None, min_length=1, max_length=40)
    quantity_on_hand: Decimal | None = Field(default=None, ge=0)
    reorder_threshold: Decimal | None = Field(default=None, ge=0)
    is_active: bool | None = None


class InventoryItemRead(InventoryItemCreate, IDModel):
    id: uuid.UUID


class MenuItemInventoryCreate(BaseModel):
    menu_item_id: uuid.UUID
    inventory_item_id: uuid.UUID
    quantity_required: Decimal = Field(gt=0)


class MenuItemInventoryRead(MenuItemInventoryCreate, IDModel):
    id: uuid.UUID
