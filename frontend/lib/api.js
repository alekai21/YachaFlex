import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: BASE_URL });

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

// Generate content
export const generateContent = (data) => api.post("/generate", data);

// History
export const getHistory = (limit = 30) => api.get(`/history?limit=${limit}`);

export default api;
