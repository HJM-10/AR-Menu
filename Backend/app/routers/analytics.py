from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ar_tracking import ARViewEvent
from app.models.menu import MenuItem
from app.schemas.analytics import ARViewEventCreate
from app.utils.response import success_response

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/ar-views", status_code=201)
def track_ar_view(payload: ARViewEventCreate, db: Session = Depends(get_db)) -> dict:
    item = db.get(MenuItem, payload.menu_item_id)
    if not item or item.is_deleted:
        raise HTTPException(status_code=404, detail="Menu item not found")
    event = ARViewEvent(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return success_response("AR view tracked", event)
