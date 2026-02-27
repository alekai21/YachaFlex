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
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")


def _build_prompt(text: str, stress_level: str) -> str:
    if stress_level == "low":
        length_instruction = (
            "The student is calm and focused. Provide a DETAILED summary (200-300 words), "
            "5 flashcards, and 5 quiz questions with 4 options each."
        )
    elif stress_level == "medium":
        length_instruction = (
            "The student has moderate stress. Provide a SIMPLIFIED summary (100-150 words), "
            "3 flashcards, and 3 quiz questions with 4 options each."
        )
    else:  # high
        length_instruction = (
            "The student is highly stressed. Provide a VERY SHORT micro-summary (50-80 words), "
            "3 simple flashcards, and 2 quiz questions with 4 options each."
        )

    return f"""You are an educational assistant adapting content for students based on their stress level.

Student stress level: {stress_level.upper()}
{length_instruction}

Text to process:
\"\"\"
{text}
\"\"\"

Respond ONLY with valid JSON in this exact format (no extra text):
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
