import { useEffect, useState } from "react";
import { getHistory } from "../lib/api";

export function useHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getHistory()
      .then((res) => {
        setRecords(res.data.records ?? []);
        setError(null);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || "No se pudo cargar el historial");
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { records, loading, error };
}
