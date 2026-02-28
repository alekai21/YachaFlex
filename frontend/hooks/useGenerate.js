import { useState } from "react";
import { generateContent, uploadPdfContent } from "../lib/api";

export function useGenerate() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async (text, recordId) => {
    setError("");
    setLoading(true);
    try {
      const res = await generateContent({
        text,
        stress_record_id: recordId ? parseInt(recordId) : undefined,
      });
      setContent(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || "Error generando contenido. Ollama esta corriendo?";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateFromPdf = async (file, recordId) => {
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (recordId) formData.append("stress_record_id", String(parseInt(recordId)));
      const res = await uploadPdfContent(formData);
      setContent(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || "Error procesando el PDF. Verifica que sea un PDF con texto.";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { content, loading, error, generate, generateFromPdf };
}
