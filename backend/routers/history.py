from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import HistoryResponse, StressHistoryPoint, StressRecord, User
from routers.auth import get_current_user

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=HistoryResponse)
def get_history(
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = (
        db.query(StressRecord)
        .filter(StressRecord.user_id == current_user.id)
        .order_by(StressRecord.timestamp.asc())
        .limit(limit)
        .all()
    )

    points = [
        StressHistoryPoint(
            timestamp=r.timestamp,
            stress_score=r.stress_score,
            stress_level=r.stress_level,
            has_biometrics=r.heart_rate is not None,
        )
        for r in records
    ]

    avg = round(sum(p.stress_score for p in points) / len(points), 2) if points else 0.0

    return HistoryResponse(
        records=points,
        average_score=avg,
        total_records=len(points),
    )
