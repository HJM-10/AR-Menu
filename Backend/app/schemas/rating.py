import uuid

from pydantic import BaseModel, Field

from app.schemas.common import IDModel


class RatingCreate(BaseModel):
    menu_item_id: uuid.UUID
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class RatingRead(RatingCreate, IDModel):
    id: uuid.UUID
    user_id: uuid.UUID | None
