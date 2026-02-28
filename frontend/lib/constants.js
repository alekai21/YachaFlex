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

export const STRESS_BG_DARK = {
  low: "#00e87a36",
  medium: "#ff950036",
  high: "#ff224436",
};

export const STRESS_BG_LIGHT = {
  low: "#7affc1bf",
  medium: "#ffc17abf",
  high: "#ff7ac1bf",
};

export const STRESS_BORDER = {
  low: "#00e87a66",
  medium: "#ff950066",
  high: "#ff224466",
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
