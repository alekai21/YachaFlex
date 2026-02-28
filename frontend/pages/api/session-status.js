import fs from "fs";
import path from "path";

// Reads the {session_id}.done file written by the FastAPI backend.
// This runs server-side (same machine), so no tunnel / CORS needed.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const { session_id } = req.query;
  if (!session_id || !/^[a-zA-Z0-9-]+$/.test(session_id)) {
    return res.status(400).json({ received: false, error: "invalid session_id" });
  }

  const sessionsDir = path.join(process.cwd(), "..", "backend", "sessions");
  const filePath = path.join(sessionsDir, `${session_id}.done`);

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    return res.status(200).json({ received: true, ...data });
  } catch (_) {
    return res.status(200).json({ received: false });
  }
}
