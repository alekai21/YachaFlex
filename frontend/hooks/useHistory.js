import { useEffect, useState } from "react";
import { getHistory } from "../lib/api";

export function useHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then((res) => setRecords(res.data.records))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { records, loading };
}
