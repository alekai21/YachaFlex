import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import GenerateRequest, GenerateResponse, GeneratedContent, StressRecord, User
from services.ollama import generate_content
from routers.auth import get_current_user

router = APIRouter(prefix="/generate", tags=["generate"])


@router.post("", response_model=GenerateResponse)
async def generate(
    data: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not data.text.strip():
        raise HTTPException(status_code=422, detail="Text cannot be empty")

    # Determine stress level
    stress_level = "medium"  # default
    record_id = data.stress_record_id

    if record_id:
        record = db.query(StressRecord).filter(
            StressRecord.id == record_id,
            StressRecord.user_id == current_user.id,
        ).first()
        if record:
            stress_level = record.stress_level
    else:
        # Use most recent record
        latest = (
            db.query(StressRecord)
            .filter(StressRecord.user_id == current_user.id)
            .order_by(StressRecord.timestamp.desc())
            .first()
        )
        if latest:
            stress_level = latest.stress_level
            record_id = latest.id

    # Call Ollama
    try:
        result = await generate_content(data.text, stress_level)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"AI service unavailable. Make sure Ollama is running. Error: {str(e)}",
        )

    # Persist generated content
    content_row = GeneratedContent(
        user_id=current_user.id,
        stress_record_id=record_id,
        original_text=data.text,
        stress_level=stress_level,
        summary=result.get("summary", ""),
        flashcards=json.dumps(result.get("flashcards", [])),
        quiz=json.dumps(result.get("quiz", [])),
    )
    db.add(content_row)
    db.commit()
    db.refresh(content_row)

    return GenerateResponse(
        stress_level=stress_level,
        summary=result.get("summary", ""),
        flashcards=result.get("flashcards", []),
        quiz=result.get("quiz", []),
        content_id=content_row.id,
    )
