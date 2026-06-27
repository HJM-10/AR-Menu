import uuid
from decimal import Decimal

from pydantic import BaseModel, Field

from app.core.enums import OrderStatus
from app.schemas.common import IDModel, ORMModel


class OrderItemCreate(BaseModel):
    menu_item_id: uuid.UUID | None = None
    deal_id: uuid.UUID | None = None
    quantity: int = Field(gt=0)
    notes: str | None = None


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=150)
    customer_phone: str = Field(min_length=1, max_length=30)
    table_number: str | None = None
    qr_session_id: uuid.UUID | None = None
    special_instructions: str | None = None
    items: list[OrderItemCreate] = Field(min_length=1)


class CheckoutRequest(BaseModel):
    cart_id: uuid.UUID
    customer_name: str = Field(min_length=1, max_length=150)
    customer_phone: str = Field(min_length=1, max_length=30)
    special_instructions: str | None = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderItemRead(ORMModel):
    id: uuid.UUID
    menu_item_id: uuid.UUID | None
    deal_id: uuid.UUID | None
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    notes: str | None


class OrderRead(IDModel):
    id: uuid.UUID
    user_id: uuid.UUID | None
    qr_session_id: uuid.UUID | None
    customer_name: str
    customer_phone: str
    table_number: str | None
    status: OrderStatus
    total_amount: Decimal
    special_instructions: str | None
    items: list[OrderItemRead] = []
