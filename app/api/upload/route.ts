import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = process.env.TEMP_UPLOAD_DIR || "./uploads";
const MAX_SIZE = 200 * 1024 * 1024; // 200MB
const ACCEPTED_MIMES = [
  "audio/wav", "audio/x-wav", "audio/wave",
  "audio/flac", "audio/x-flac",
  "audio/mpeg", "audio/mp3",
  "audio/aiff", "audio/x-aiff",
  "audio/ogg", "application/ogg",
  "audio/mp4", "audio/x-m4a",
];

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Must be multipart/form-data" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `File too large. Max 200MB.` }, { status: 413 });
    }

    if (!ACCEPTED_MIMES.includes(file.type)) {
      return NextResponse.json({
        error: `Unsupported format: ${file.type}. Use WAV, FLAC, MP3, AIFF, OGG, or M4A.`,
      }, { status: 415 });
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const fileId = randomUUID();
    const ext = file.name.split(".").pop()?.toLowerCase() || "wav";
    const filename = `${fileId}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Get basic info from Python service if available
    let duration = 0;
    const pythonUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
    try {
      const infoRes = await fetch(`${pythonUrl}/info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_path: filePath }),
        signal: AbortSignal.timeout(5000),
      });
      if (infoRes.ok) {
        const info = await infoRes.json();
        duration = info.duration || 0;
      }
    } catch {
      // Python service not available, continue without duration
    }

    return NextResponse.json({
      file_id: fileId,
      filename: file.name,
      duration,
      format: ext.toUpperCase(),
      size: file.size,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
