import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.TEMP_UPLOAD_DIR || "./uploads";

const FORMAT_MIME: Record<string, string> = {
  wav32:  "audio/wav",
  wav24:  "audio/wav",
  wav16:  "audio/wav",
  flac:   "audio/flac",
  mp3320: "audio/mpeg",
  mp3128: "audio/mpeg",
  aac256: "audio/mp4",
};

const FORMAT_EXT: Record<string, string> = {
  wav32: "wav", wav24: "wav", wav16: "wav",
  flac: "flac",
  mp3320: "mp3", mp3128: "mp3",
  aac256: "m4a",
};

// Tier restrictions: free users only get mp3128
const FORMAT_TIER: Record<string, string> = {
  wav32: "pro", wav24: "paid", wav16: "paid", flac: "paid",
  mp3320: "paid", mp3128: "free", aac256: "paid",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const masterId = searchParams.get("master_id");
  const format = searchParams.get("format") || "mp3128";
  const token = searchParams.get("token");

  if (!masterId) {
    return NextResponse.json({ error: "master_id required" }, { status: 400 });
  }

  // TODO: Validate token against database for paid formats
  const userTier = token ? "paid" : "free"; // Simplified
  const requiredTier = FORMAT_TIER[format] || "paid";

  if (requiredTier !== "free" && userTier === "free") {
    return NextResponse.json({
      error: "This format requires a paid plan. Upgrade to download.",
      upgrade_url: "/pricing",
    }, { status: 403 });
  }

  // Find master file
  const ext = FORMAT_EXT[format] || "mp3";
  const filename = `${masterId}_${format}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, "masters", filename);

  if (!existsSync(filePath)) {
    // In dev: return a placeholder response
    return NextResponse.json({ error: "Master file not found or expired" }, { status: 404 });
  }

  const fileBuffer = await readFile(filePath);
  const mime = FORMAT_MIME[format] || "audio/mpeg";

  return new Response(fileBuffer, {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="master_${masterId}.${ext}"`,
      "Content-Length": String(fileBuffer.length),
      "Cache-Control": "private, max-age=604800", // 7 days
    },
  });
}
