from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import CheckinRequest, CheckinResponse, StressRecord, User
from services.stress import calculate_stress
from routers.auth import get_current_user

router = APIRouter(prefix="/checkin", tags=["checkin"])


@router.post("", response_model=CheckinResponse)
def submit_checkin(
    data: CheckinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate ranges
    for field, value in [("bienestar", data.bienestar), ("sueno", data.sueno), ("concentracion", data.concentracion)]:
        if not (1 <= value <= 5):
            raise HTTPException(status_code=422, detail=f"{field} must be between 1 and 5")

    checkin_score, _ = calculate_stress(data.bienestar, data.sueno, data.concentracion)
    stress_score, stress_level = calculate_stress(data.bienestar, data.sueno, data.concentracion)

    record = StressRecord(
        user_id=current_user.id,
        bienestar=data.bienestar,
        sueno=data.sueno,
        concentracion=data.concentracion,
        checkin_score=checkin_score,
        stress_score=stress_score,
        stress_level=stress_level,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    messages = {
        "low": "You're doing great! Here's detailed content to help you learn.",
        "medium": "Moderate stress detected. Here's simplified content to keep you on track.",
        "high": "High stress detected. Take a breath — here's a quick overview to help you.",
    }

    return CheckinResponse(
        stress_score=stress_score,
        stress_level=stress_level,
        record_id=record.id,
        message=messages[stress_level],
    )
