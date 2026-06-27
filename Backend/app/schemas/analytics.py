import uuid

from pydantic import BaseModel, Field

from app.schemas.common import IDModel


class ARViewEventCreate(BaseModel):
    menu_item_id: uuid.UUID
    qr_session_id: uuid.UUID | None = None
    user_id: uuid.UUID | None = None
    duration_seconds: int | None = Field(default=None, ge=0)
    device_info: dict | None = None


class ARViewEventRead(ARViewEventCreate, IDModel):
    id: uuid.UUID
