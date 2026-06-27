from typing import Any

from fastapi.encoders import jsonable_encoder


SENSITIVE_KEYS = {"password_hash"}


def _strip_sensitive(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            key: _strip_sensitive(item)
            for key, item in value.items()
            if key not in SENSITIVE_KEYS
        }
    if isinstance(value, list):
        return [_strip_sensitive(item) for item in value]
    return value


def success_response(message: str = "Operation successful", data: Any = None) -> dict:
    return {
        "success": True,
        "message": message,
        "data": _strip_sensitive(jsonable_encoder(data)),
    }


def error_response(message: str, detail: Any = None) -> dict:
    return {"success": False, "message": message, "detail": jsonable_encoder(detail or {})}
