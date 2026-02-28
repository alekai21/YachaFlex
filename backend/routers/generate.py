import io
import json
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from database import get_db
from models import GenerateRequest, GenerateResponse, GeneratedContent, StressRecord, User
from routers.auth import get_current_user
from services.ollama import generate_content

router = APIRouter(prefix="/generate", tags=["generate"])


async def _resolve_stress_level(db: Session, current_user: User, record_id: Optional[int]):
    """Returns (stress_level, resolved_record_id)."""
    stress_level = "medium"

    if record_id:
        record = db.query(StressRecord).filter(
            StressRecord.id == record_id,
            StressRecord.user_id == current_user.id,
        ).first()
        if record:
            stress_level = record.stress_level
    else:
        latest = (
            db.query(StressRecord)
            .filter(StressRecord.user_id == current_user.id)
            .order_by(StressRecord.timestamp.desc())
            .first()
        )
        if latest:
            stress_level = latest.stress_level
            record_id = latest.id

    return stress_level, record_id


async def _run_generate(text: str, stress_level: str, record_id: Optional[int],
                        current_user: User, db: Session) -> GenerateResponse:
    """Shared logic: call Ollama, persist, return response."""
    try:
        result = await generate_content(text, stress_level)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"AI service unavailable. Make sure Ollama is running. Error: {str(e)}",
        )

    content_row = GeneratedContent(
        user_id=current_user.id,
        stress_record_id=record_id,
        original_text=text,
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


@router.post("", response_model=GenerateResponse)
async def generate(
    data: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not data.text.strip():
        raise HTTPException(status_code=422, detail="Text cannot be empty")

    stress_level, record_id = await _resolve_stress_level(db, current_user, data.stress_record_id)
    return await _run_generate(data.text, stress_level, record_id, current_user, db)


@router.post("/pdf", response_model=GenerateResponse)
async def generate_from_pdf(
    file: UploadFile = File(...),
    stress_record_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="El archivo debe ser un PDF")

    try:
        import pypdf

        raw = await file.read()
        reader = pypdf.PdfReader(io.BytesIO(raw))
        text = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"No se pudo leer el PDF: {str(e)}")

    if len(text) < 50:
        raise HTTPException(
            status_code=422,
            detail="No se pudo extraer suficiente texto del PDF (mínimo 50 caracteres)",
        )

    stress_level, record_id = await _resolve_stress_level(db, current_user, stress_record_id)
    return await _run_generate(text, stress_level, record_id, current_user, db)
