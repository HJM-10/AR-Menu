import uuid
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import IDModel


class MenuCategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    display_order: int = 0
    is_active: bool = True


class MenuCategoryCreate(MenuCategoryBase):
    pass


class MenuCategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    display_order: int | None = None
    is_active: bool | None = None


class MenuCategoryRead(MenuCategoryBase, IDModel):
    id: uuid.UUID


class MenuItemBase(BaseModel):
    category_id: uuid.UUID
    name: str = Field(min_length=1, max_length=180)
    description: str | None = None
    price: Decimal = Field(gt=0)
    image_url: str | None = None
    model_3d_url: str | None = None
    ar_enabled: bool = False
    is_available: bool = True
    preparation_time_minutes: int | None = Field(default=None, ge=0)


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    category_id: uuid.UUID | None = None
    name: str | None = Field(default=None, min_length=1, max_length=180)
    description: str | None = None
    price: Decimal | None = Field(default=None, gt=0)
    image_url: str | None = None
    model_3d_url: str | None = None
    ar_enabled: bool | None = None
    is_available: bool | None = None
    preparation_time_minutes: int | None = Field(default=None, ge=0)


class MenuItemAvailabilityUpdate(BaseModel):
    is_available: bool


class MenuItemRead(MenuItemBase, IDModel):
    id: uuid.UUID
    rating_avg: Decimal
    rating_count: int
