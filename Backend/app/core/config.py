import json
from functools import lru_cache
from typing import Annotated

from pydantic import AnyUrl, BeforeValidator
from pydantic_settings import BaseSettings, SettingsConfigDict


def assemble_cors_origins(value: str | list[str]) -> list[str]:
    if isinstance(value, str):
        if value.startswith("["):
            return json.loads(value)
        return [item.strip() for item in value.split(",") if item.strip()]
    return value


class Settings(BaseSettings):
    app_name: str = "AR Menu API"
    environment: str = "local"
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    google_oauth_client_ids: Annotated[
        list[str], BeforeValidator(assemble_cors_origins)
    ] = []
    backend_cors_origins: Annotated[
        list[AnyUrl] | list[str], BeforeValidator(assemble_cors_origins)
    ] = []

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
