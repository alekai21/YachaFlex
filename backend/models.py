from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
from pydantic import BaseModel, EmailStr
from typing import Optional
import enum


# ── SQLAlchemy ORM models ──────────────────────────────────────────────────

class StressLevelEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    nombre = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    stress_records = relationship("StressRecord", back_populates="user")
    generated_content = relationship("GeneratedContent", back_populates="user")


class StressRecord(Base):
    __tablename__ = "stress_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Check-in scores (1-5)
    bienestar = Column(Float, nullable=False)
    sueno = Column(Float, nullable=False)
    concentracion = Column(Float, nullable=False)
    checkin_score = Column(Float, nullable=False)  # 0-100 normalized
    # Biometric data (optional, from smartwatch)
    heart_rate = Column(Float, nullable=True)
    hrv = Column(Float, nullable=True)
    activity = Column(Float, nullable=True)  # steps or activity level
    # Final computed stress
    stress_score = Column(Float, nullable=False)  # 0-100
    stress_level = Column(String, nullable=False)  # low/medium/high
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="stress_records")
    generated_content = relationship("GeneratedContent", back_populates="stress_record")


class GeneratedContent(Base):
    __tablename__ = "generated_content"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stress_record_id = Column(Integer, ForeignKey("stress_records.id"), nullable=True)
    original_text = Column(Text, nullable=False)
    stress_level = Column(String, nullable=False)
    summary = Column(Text, nullable=True)
    flashcards = Column(Text, nullable=True)   # JSON string
    quiz = Column(Text, nullable=True)         # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="generated_content")
    stress_record = relationship("StressRecord", back_populates="generated_content")


# ── Pydantic schemas ───────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    nombre: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    nombre: str
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class CheckinRequest(BaseModel):
    bienestar: float       # 1-10
    sueno: float           # 1-10
    concentracion: float   # 1-10


class CheckinResponse(BaseModel):
    stress_score: float
    stress_level: str
    record_id: int
    message: str


class BiometricsRequest(BaseModel):
    heart_rate: Optional[float] = None   # bpm
    hrv: Optional[float] = None          # ms
    activity: Optional[float] = None     # steps or activity level


class BiometricsResponse(BaseModel):
    stress_score: float
    stress_level: str
    record_id: int
    message: str


class GenerateRequest(BaseModel):
    text: str
    stress_record_id: Optional[int] = None


class FlashCard(BaseModel):
    question: str
    answer: str


class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    correct_index: int


class GenerateResponse(BaseModel):
    stress_level: str
    summary: str
    flashcards: list[FlashCard]
    quiz: list[QuizQuestion]
    content_id: int


class StressHistoryPoint(BaseModel):
    timestamp: datetime
    stress_score: float
    stress_level: str
    has_biometrics: bool

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    records: list[StressHistoryPoint]
    average_score: float
    total_records: int
