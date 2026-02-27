// ─── Claves de almacenamiento ────────────────────────────────────────────────
export const TOKEN_KEY = "yachaflex_token";
export const USER_KEY = "yachaflex_user";

// ─── Niveles de estrés ───────────────────────────────────────────────────────
export const STRESS_THRESHOLDS = { low: 33, medium: 66 };

export const STRESS_COLORS = {
  low: "#00e87a",
  medium: "#ff9500",
  high: "#ff2244",
};

export const STRESS_BG = {
  low: "rgba(0,232,122,0.10)",
  medium: "rgba(255,149,0,0.10)",
  high: "rgba(255,34,68,0.10)",
};

export const STRESS_BORDER = {
  low: "rgba(0,232,122,0.4)",
  medium: "rgba(255,149,0,0.4)",
  high: "rgba(255,34,68,0.4)",
};

export const STRESS_LABELS = {
  low: "BAJO",
  medium: "MEDIO",
  high: "ALTO",
};

export const STRESS_DESCRIPTIONS = {
  low: "En optimas condiciones. Aprovecha para estudiar contenido detallado.",
  medium: "Estres moderado detectado. Te damos resumenes simplificados y flashcards.",
  high: "Estres alto. Respira. Aqui tienes lo mas importante en formato breve.",
};

// ─── Utilidades ───────────────────────────────────────────────────────────────
/** Devuelve el color hex según score numérico (0-100) */
export function getStressColor(score) {
  if (score <= STRESS_THRESHOLDS.low) return STRESS_COLORS.low;
  if (score <= STRESS_THRESHOLDS.medium) return STRESS_COLORS.medium;
  return STRESS_COLORS.high;
}

/** Devuelve el nivel string según score numérico */
export function getStressLevel(score) {
  if (score <= STRESS_THRESHOLDS.low) return "low";
  if (score <= STRESS_THRESHOLDS.medium) return "medium";
  return "high";
}
