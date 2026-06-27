import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_active_user
from app.core.config import get_settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.database import get_db
from app.models.role import Role
from app.models.user import User
from app.schemas.auth import GoogleLoginRequest, LoginRequest
from app.schemas.user import UserCreate
from app.utils.response import success_response

router = APIRouter(prefix="/auth", tags=["auth"])


def _get_customer_role(db: Session) -> Role:
    role = db.query(Role).filter(Role.name == "customer", Role.is_deleted.is_(False)).first()
    if not role:
        raise HTTPException(status_code=500, detail="Customer role is not seeded")
    return role


def _issue_login_response(user: User) -> dict:
    token = create_access_token(str(user.id), {"role": user.role.name})
    return success_response(
        "Login successful",
        {"access_token": token, "token_type": "bearer", "user": user},
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> dict:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    role = _get_customer_role(db)
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        phone=payload.phone,
        password_hash=get_password_hash(payload.password),
        role_id=role.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return success_response("Registration successful", user)


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    user = (
        db.query(User)
        .options(joinedload(User.role))
        .filter(User.email == payload.email, User.is_deleted.is_(False))
        .first()
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")
    return _issue_login_response(user)


@router.post("/google")
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)) -> dict:
    settings = get_settings()
    allowed_client_ids = settings.google_oauth_client_ids
    if not allowed_client_ids:
        raise HTTPException(status_code=500, detail="Google OAuth client IDs are not configured")

    try:
        claims = google_id_token.verify_oauth2_token(
            payload.id_token,
            google_requests.Request(),
        )
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid Google token") from exc

    if claims.get("aud") not in allowed_client_ids:
        raise HTTPException(status_code=401, detail="Google token audience is not allowed")
    if claims.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
        raise HTTPException(status_code=401, detail="Invalid Google token issuer")
    if not claims.get("email_verified"):
        raise HTTPException(status_code=401, detail="Google email is not verified")

    email = claims.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Google token is missing email")

    user = (
        db.query(User)
        .options(joinedload(User.role))
        .filter(User.email == email, User.is_deleted.is_(False))
        .first()
    )

    if user:
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Inactive user")
        return _issue_login_response(user)

    role = _get_customer_role(db)
    user = User(
        email=email,
        full_name=claims.get("name") or email.split("@")[0],
        phone=None,
        password_hash=get_password_hash(secrets.token_urlsafe(32)),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _issue_login_response(user)


@router.get("/me")
def me(current_user: User = Depends(get_current_active_user)) -> dict:
    return success_response(data=current_user)
