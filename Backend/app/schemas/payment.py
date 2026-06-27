import uuid
from decimal import Decimal

from pydantic import BaseModel, Field

from app.core.enums import PaymentStatus
from app.schemas.common import IDModel


class PaymentGatewayCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    code: str = Field(min_length=1, max_length=120)
    is_active: bool = True
    config: dict | None = None


class PaymentGatewayUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    code: str | None = Field(default=None, min_length=1, max_length=120)
    is_active: bool | None = None
    config: dict | None = None


class PaymentGatewayRead(PaymentGatewayCreate, IDModel):
    id: uuid.UUID


class PaymentCreate(BaseModel):
    order_id: uuid.UUID
    gateway_id: uuid.UUID
    amount: Decimal = Field(gt=0)
    currency: str = Field(default="PKR", min_length=3, max_length=10)
    gateway_payment_id: str | None = None
    payment_method: str | None = None
    raw_response: dict | None = None


class PaymentStatusUpdate(BaseModel):
    status: PaymentStatus
    gateway_payment_id: str | None = None
    payment_method: str | None = None
    raw_response: dict | None = None


class PaymentRead(IDModel):
    id: uuid.UUID
    order_id: uuid.UUID
    gateway_id: uuid.UUID
    amount: Decimal
    currency: str
    status: PaymentStatus
    gateway_payment_id: str | None
    payment_method: str | None
    raw_response: dict | None
