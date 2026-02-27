"""
Stress scoring algorithm.

Inputs:
  - Check-in (bienestar, sueno, concentracion) – scale 1-5 each
  - Biometrics (heart_rate bpm, hrv ms, activity steps) – optional

Output:
  - stress_score: float 0-100  (higher = more stressed)
  - stress_level: "low" | "medium" | "high"
"""


def _checkin_to_stress(bienestar: float, sueno: float, concentracion: float) -> float:
    """Convert check-in answers (1-5) to a stress score (0-100)."""
    avg = (bienestar + sueno + concentracion) / 3  # 1-5
    # Invert: 1 (very bad) → 100 (high stress), 5 (very good) → 0 (low stress)
    return round((5 - avg) / 4 * 100, 2)


def _biometrics_to_stress(
    heart_rate: float | None,
    hrv: float | None,
    activity: float | None,
) -> float | None:
    """Convert biometric values to a stress score (0-100). Returns None if no data."""
    scores = []

    if heart_rate is not None:
        # HR: 50 bpm → 0 stress, 120+ bpm → 100 stress
        hr_score = max(0.0, min(100.0, (heart_rate - 50) / 70 * 100))
        scores.append(hr_score)

    if hrv is not None:
        # HRV: 80ms+ → 0 stress, 10ms or less → 100 stress
        hrv_score = max(0.0, min(100.0, (80 - hrv) / 70 * 100))
        scores.append(hrv_score)

    if activity is not None:
        # Very low activity can indicate fatigue/high stress
        # activity_score: 0 steps → 30 stress, 10000+ → 0 stress
        activity_score = max(0.0, min(30.0, (1 - min(activity, 10000) / 10000) * 30))
        scores.append(activity_score)

    if not scores:
        return None

    return round(sum(scores) / len(scores), 2)


def calculate_stress(
    bienestar: float,
    sueno: float,
    concentracion: float,
    heart_rate: float | None = None,
    hrv: float | None = None,
    activity: float | None = None,
) -> tuple[float, str]:
    """
    Returns (stress_score, stress_level).
    """
    checkin_score = _checkin_to_stress(bienestar, sueno, concentracion)
    bio_score = _biometrics_to_stress(heart_rate, hrv, activity)

    if bio_score is not None:
        # 60% check-in, 40% biometrics
        final_score = round(checkin_score * 0.6 + bio_score * 0.4, 2)
    else:
        final_score = checkin_score

    if final_score <= 33:
        level = "low"
    elif final_score <= 66:
        level = "medium"
    else:
        level = "high"

    return final_score, level
