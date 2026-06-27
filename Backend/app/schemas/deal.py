import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import IDModel


class DealBase(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    description: str | None = None
    deal_price: Decimal = Field(ge=0)
    image_url: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    is_active: bool = True


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    deal_price: Decimal | None = Field(default=None, ge=0)
    image_url: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    is_active: bool | None = None


class DealRead(DealBase, IDModel):
    id: uuid.UUID


class DealItemCreate(BaseModel):
    deal_id: uuid.UUID
    menu_item_id: uuid.UUID
    quantity: int = Field(default=1, gt=0)


class DealItemUpdate(BaseModel):
    menu_item_id: uuid.UUID | None = None
    quantity: int | None = Field(default=None, gt=0)


class DealItemRead(DealItemCreate, IDModel):
    id: uuid.UUID
