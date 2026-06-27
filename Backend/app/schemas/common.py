import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class IDModel(ORMModel):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    deleted_at: datetime | None


class MessageResponse(BaseModel):
    success: bool
    message: str
    data: object | None = None
