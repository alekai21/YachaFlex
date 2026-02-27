"""
Endpoint para recibir datos biométricos del smartwatch (Health Connect Android).
Actualiza el último StressRecord del usuario con datos biométricos y recalcula el estrés.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import BiometricsRequest, BiometricsResponse, StressRecord, User
from services.stress import calculate_stress
from routers.auth import get_current_user

router = APIRouter(prefix="/biometrics", tags=["biometrics"])


@router.post("", response_model=BiometricsResponse)
def submit_biometrics(
    data: BiometricsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get the most recent stress record for this user
    record = (
        db.query(StressRecord)
        .filter(StressRecord.user_id == current_user.id)
        .order_by(StressRecord.timestamp.desc())
        .first()
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="No check-in found. Please complete a check-in first.",
        )

    # Update biometric fields
    record.heart_rate = data.heart_rate
    record.hrv = data.hrv
    record.activity = data.activity

    # Recalculate stress with biometrics
    stress_score, stress_level = calculate_stress(
        bienestar=record.bienestar,
        sueno=record.sueno,
        concentracion=record.concentracion,
        heart_rate=data.heart_rate,
        hrv=data.hrv,
        activity=data.activity,
    )

    record.stress_score = stress_score
    record.stress_level = stress_level
    db.commit()
    db.refresh(record)

    return BiometricsResponse(
        stress_score=stress_score,
        stress_level=stress_level,
        record_id=record.id,
        message=f"Biometrics received. Stress level updated to: {stress_level}",
    )
