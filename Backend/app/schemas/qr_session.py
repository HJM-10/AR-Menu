import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import QRSessionStatus
from app.schemas.common import ORMModel


class QRSessionCreate(BaseModel):
    table_number: str = Field(min_length=1, max_length=40)
    expires_at: datetime | None = None
    device_metadata: dict | None = None


class QRSessionRead(ORMModel):
    id: uuid.UUID
    table_number: str
    session_token: str
    customer_id: uuid.UUID | None
    status: QRSessionStatus
    expires_at: datetime | None
    device_metadata: dict | None
    created_at: datetime
    updated_at: datetime
