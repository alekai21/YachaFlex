"""
Groq API client for generating adaptive educational content.
Uses the free Groq API — no local installation needed.
Groq is OpenAI-compatible and extremely fast.

Sign up at: https://console.groq.com
Free tier: ~14,400 requests/day with llama-3.1-8b-instant
"""

import httpx
import json
import re
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def _build_messages(text: str, stress_level: str) -> list:
    if stress_level == "low":
        instructions = (
            "The student is calm and focused. Write a DETAILED summary (500-700 words), "
            "exactly 10 flashcards, and exactly 7 quiz questions with 5 options each."
        )
    elif stress_level == "medium":
        instructions = (
            "The student has moderate stress. Write a SIMPLIFIED summary (200-350 words), "
            "exactly 5 flashcards, and exactly 4 quiz questions with 4 options each."
        )
    else:  # high
        instructions = (
            "The student is highly stressed. Write a VERY SHORT micro-summary (50-80 words), "
            "exactly 3 simple flashcards, and exactly 2 quiz questions with 3 options each."
        )

    return [
        {
            "role": "system",
            "content": (
                "You are an educational assistant. "
                "You MUST respond ONLY with a valid JSON object. "
                "No markdown, no code blocks, no explanation — just the raw JSON."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Adapt the following text for a student with {stress_level.upper()} stress level.\n"
                f"{instructions}\n\n"
                f"Text:\n\"\"\"{text}\"\"\"\n\n"
                "Respond ONLY with this exact JSON structure:\n"
                '{\n'
                '  "summary": "...",\n'
                '  "flashcards": [\n'
                '    {"question": "...", "answer": "..."}\n'
                '  ],\n'
                '  "quiz": [\n'
                '    {\n'
                '      "question": "...",\n'
                '      "options": ["A", "B", "C", "D"],\n'
                '      "correct_index": 0\n'
                '    }\n'
                '  ]\n'
                '}'
            ),
        },
    ]


def _extract_json(raw: str) -> dict:
    """Extract a valid JSON object from raw model output."""
    raw = raw.strip()

    # Remove markdown code blocks if present
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Find first { ... } block
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return {}


async def generate_content(text: str, stress_level: str) -> dict:
    """
    Calls Groq API to generate summary, flashcards and quiz.
    Returns a dict with keys: summary, flashcards, quiz.
    """
    if not GROQ_API_KEY or GROQ_API_KEY.startswith("gsk_XXX"):
        raise ValueError("GROQ_API_KEY not configured in .env file")

    messages = _build_messages(text, stress_level)

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": GROQ_MODEL,
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 3000,
                "response_format": {"type": "json_object"},
            },
        )
        response.raise_for_status()
        data = response.json()

    raw = data["choices"][0]["message"]["content"]
    result = _extract_json(raw)

    return {
        "summary": result.get("summary", ""),
        "flashcards": result.get("flashcards", []),
        "quiz": result.get("quiz", []),
    }
