"""
Ollama client for generating adaptive educational content.
Calls the local Ollama API (http://localhost:11434).
"""

import httpx
import json
import os
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:1b")


def _build_prompt(text: str, stress_level: str) -> str:
    if stress_level == "low":

        length_instruction = (
            "El estudiante está tranquilo y concentrado. Proporciona un resumen DETALLADO (200-300 palabras), "
            "5 tarjetas de estudio y 5 preguntas de cuestionario con 4 opciones cada una."
        )
    elif stress_level == "medium":
        length_instruction = (
            "El estudiante tiene estrés moderado. Proporciona un resumen SIMPLIFICADO (100-150 palabras), "
            "3 tarjetas de estudio y 3 preguntas de cuestionario con 4 opciones cada una."
        )
    else:  # alto
        length_instruction = (
            "El estudiante está muy estresado. Proporciona un micro-resumen CORTO (50-80 palabras), "
            "3 tarjetas de estudio simples y 2 preguntas de cuestionario con 4 opciones cada una."
        )
   
    return f"""Eres un asistente educativo que adapta el contenido para estudiantes según su nivel de estrés.
    Detecta el idioma del texto y responde en el mismo idioma.

Nivel de estrés del estudiante: {stress_level.upper()}
{length_instruction}

Texto a procesar:
\"\"\"
{text}
\"\"\"

Responde SOLO con JSON válido en este formato exacto (sin texto adicional):
{{
  "summary": "...",
  "flashcards": [
    {{"question": "...", "answer": "..."}},
    ...
  ],
  "quiz": [
    {{
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_index": 0
    }},
    ...
  ]
}}"""


async def generate_content(text: str, stress_level: str) -> dict:
    """
    Calls Ollama to generate summary, flashcards and quiz.
    Returns a dict with keys: summary, flashcards, quiz.
    Raises httpx.HTTPError on connection issues.
    """
    prompt = _build_prompt(text, stress_level)

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",
            },
        )
        response.raise_for_status()
        data = response.json()

    raw = data.get("response", "{}")
    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        # Attempt to extract JSON block if model added extra text
        start = raw.find("{")
        end = raw.rfind("}") + 1
        result = json.loads(raw[start:end]) if start != -1 else {}

    return {
        "summary": result.get("summary", ""),
        "flashcards": result.get("flashcards", []),
        "quiz": result.get("quiz", []),
    }
