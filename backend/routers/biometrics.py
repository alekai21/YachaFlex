"""
Endpoint para recibir datos biométricos del smartwatch (Health Connect Android).
Actualiza el último StressRecord del usuario con datos biométricos y recalcula el estrés.

Session tracking: each QR code embeds a unique session_id (UUID).
The Android app forwards it in the POST body. We store received data in an
in-memory dict keyed by session_id so the frontend can poll without false positives
from stale records.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db
from models import BiometricsRequest, BiometricsResponse, StressRecord, User
from services.stress import calculate_stress
from routers.auth import get_current_user

router = APIRouter(prefix="/biometrics", tags=["biometrics"])

# In-memory map: session_id -> biometric payload
# Cleared on server restart; fine for demo purposes.
_biometric_sessions: dict = {}


@router.get("/status")
def get_biometrics_status(
    session_id: str = Query(..., description="UUID embedded in the QR code"),
    _: User = Depends(get_current_user),
):
    if session_id in _biometric_sessions:
        return {"received": True, **_biometric_sessions[session_id]}
    return {"received": False}


@router.post("", response_model=BiometricsResponse)
def submit_biometrics(
    data: BiometricsRequest,
    session_id: Optional[str] = Query(None, description="UUID forwarded via endpoint URL from QR"),
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

    # Notify the polling endpoint that this session has data.
    # Prefer query param (embedded in endpoint URL from QR), fall back to body field.
    sid = session_id or data.session_id
    if sid:
        _biometric_sessions[sid] = {
            "heart_rate": data.heart_rate,
            "hrv": data.hrv,
            "activity": data.activity,
            "stress_score": stress_score,
            "stress_level": stress_level,
        }

    return BiometricsResponse(
        stress_score=stress_score,
        stress_level=stress_level,
        record_id=record.id,
        message=f"Biometrics received. Stress level updated to: {stress_level}",
    )
