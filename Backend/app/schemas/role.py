import uuid

from pydantic import BaseModel, Field

from app.schemas.common import IDModel


class RoleCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    description: str | None = None


class RoleUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=50)
    description: str | None = None


class RoleRead(RoleCreate, IDModel):
    id: uuid.UUID
