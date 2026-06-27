import uuid

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import IDModel


class FeedbackCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    email: EmailStr | None = None
    message: str = Field(min_length=1)


class FeedbackRead(FeedbackCreate, IDModel):
    id: uuid.UUID
    user_id: uuid.UUID | None
