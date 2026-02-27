import { useState } from "react";
import { submitCheckin } from "../lib/api";

export function useCheckin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (values) => {
    setError("");
    setLoading(true);
    try {
      const res = await submitCheckin(values);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || "Error al enviar check-in";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
