import uuid

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import IDModel, ORMModel
from app.schemas.role import RoleRead


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=40)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class AdminUserCreate(UserCreate):
    role_name: str = "customer"
    is_active: bool = True


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=40)
    is_active: bool | None = None


class UserRoleUpdate(BaseModel):
    role_id: uuid.UUID | None = None
    role_name: str | None = None


class UserRead(UserBase, IDModel):
    id: uuid.UUID
    role_id: uuid.UUID
    role: RoleRead | None = None
    is_active: bool


class UserSelfRead(UserRead, ORMModel):
    pass
