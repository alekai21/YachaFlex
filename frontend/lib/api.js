import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: BASE_URL, timeout: 12000 });

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("yachaflex_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);

// Check-in
export const submitCheckin = (data) => api.post("/checkin", data);

// Biometrics (used by Android dev too)
export const submitBiometrics = (data) => api.post("/biometrics", data);
export const getBiometricsStatus = (sessionId) => api.get(`/biometrics/status?session_id=${sessionId}`);

// Generate content
export const generateContent = (data) => api.post("/generate", data);
export const uploadPdfContent = (formData) =>
  api.post("/generate/pdf", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// History
export const getHistory = (limit = 30) => api.get(`/history?limit=${limit}`);

// Health
export const checkHealth = () => api.get("/health");

export default api;
