from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_optional_current_user
from app.database import get_db
from app.models.qr_session import QRSession
from app.models.user import User
from app.schemas.qr_session import QRSessionCreate
from app.utils.response import success_response

router = APIRouter(prefix="/qr-sessions", tags=["qr-sessions"])


@router.post("", status_code=201)
def create_qr_session(payload: QRSessionCreate, db: Session = Depends(get_db), user: User | None = Depends(get_optional_current_user)) -> dict:
    session = QRSession(
        table_number=payload.table_number,
        customer_id=user.id if user else None,
        expires_at=payload.expires_at,
        device_metadata=payload.device_metadata,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return success_response("QR session created", session)


@router.get("/{session_token}")
def get_qr_session(session_token: str, db: Session = Depends(get_db)) -> dict:
    session = db.query(QRSession).filter(QRSession.session_token == session_token, QRSession.is_deleted.is_(False)).first()
    if not session:
        raise HTTPException(status_code=404, detail="QR session not found")
    return success_response(data=session)
