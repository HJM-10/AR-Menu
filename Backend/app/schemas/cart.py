import uuid
from decimal import Decimal

from pydantic import BaseModel, Field

from app.core.enums import CartStatus
from app.schemas.common import IDModel, ORMModel


class CartCreate(BaseModel):
    qr_session_id: uuid.UUID | None = None
    table_number: str | None = None


class CartItemCreate(BaseModel):
    menu_item_id: uuid.UUID | None = None
    deal_id: uuid.UUID | None = None
    quantity: int = Field(default=1, ge=1)
    notes: str | None = None


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)
    notes: str | None = None


class CartItemRead(ORMModel):
    id: uuid.UUID
    menu_item_id: uuid.UUID | None
    deal_id: uuid.UUID | None
    quantity: int
    unit_price: Decimal
    notes: str | None


class CartRead(IDModel):
    id: uuid.UUID
    user_id: uuid.UUID | None
    qr_session_id: uuid.UUID | None
    table_number: str | None
    status: CartStatus
    items: list[CartItemRead] = []
