from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.menu import MenuItem
from app.models.rating import Rating


def recalculate_menu_item_rating(db: Session, menu_item_id) -> None:
    avg_rating, count = (
        db.query(func.avg(Rating.rating), func.count(Rating.id))
        .filter(Rating.menu_item_id == menu_item_id, Rating.is_deleted.is_(False))
        .one()
    )
    item = db.get(MenuItem, menu_item_id)
    if not item:
        return
    item.rating_count = int(count or 0)
    item.rating_avg = (
        Decimal(str(avg_rating)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if avg_rating is not None
        else Decimal("0.00")
    )
