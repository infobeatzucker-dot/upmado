import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { getTierFromPlan, canDownloadFormat } from "@/lib/auth";

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

// ── Token helpers ─────────────────────────────────────────────────────────────
interface PPUToken {
  orderId:   string;
  masterId:  string | null;
  expiresAt: number;
}

function parsePPUToken(raw: string): PPUToken | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const obj  = JSON.parse(json) as PPUToken;
    if (!obj.orderId || typeof obj.expiresAt !== "number") return null;
    return obj;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const masterId = searchParams.get("master_id");
  const format   = searchParams.get("format") || "mp3128";
  const token    = searchParams.get("token");   // PPU download token

  if (!masterId) {
    return NextResponse.json({ error: "master_id required" }, { status: 400 });
  }

  // ── Determine user tier ───────────────────────────────────────────────────
  let userTier: "free" | "paid" | "pro" = "free";

  if (token) {
    // Pay-per-use flow: validate PPU token
    const ppu = parsePPUToken(token);

    if (!ppu) {
      return NextResponse.json({ error: "Ungültiger Download-Token" }, { status: 403 });
    }
    if (Date.now() > ppu.expiresAt) {
      return NextResponse.json({
        error: "Download-Token abgelaufen (2-Stunden-Fenster). Bitte kaufe den Track erneut.",
        upgrade_url: "/pricing",
      }, { status: 403 });
    }

    // Verify order exists and is completed in DB
    const order = await db.order.findUnique({ where: { id: ppu.orderId } });
    if (!order || order.status !== "completed") {
      return NextResponse.json({ error: "Bestellung nicht gefunden oder nicht bezahlt" }, { status: 403 });
    }
    if (order.downloadExpires && new Date() > order.downloadExpires) {
      return NextResponse.json({
        error: "Download-Zeitfenster abgelaufen.",
        upgrade_url: "/pricing",
      }, { status: 403 });
    }

    userTier = "paid"; // PPU unlocks paid formats

  } else {
    // Session-based: check active subscription tier
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const sub = await db.subscription.findFirst({
        where: {
          userId:     session.user.id,
          status:     "active",
          validUntil: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });
      userTier = getTierFromPlan(sub?.planType ?? null);
    }
  }

  // ── Format access check ───────────────────────────────────────────────────
  if (!canDownloadFormat(userTier, format)) {
    return NextResponse.json({
      error: "Dieses Format ist für deinen Plan nicht verfügbar. Bitte upgraden.",
      upgrade_url: "/pricing",
    }, { status: 403 });
  }

  // ── Serve file ────────────────────────────────────────────────────────────
  const ext      = FORMAT_EXT[format] || "mp3";
  const filename = `${masterId}_${format}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, "masters", filename);

  if (!existsSync(filePath)) {
    return NextResponse.json({
      error: "Master-Datei nicht gefunden oder abgelaufen (2h Fenster)",
    }, { status: 404 });
  }

  const fileBuffer = await readFile(filePath);
  const mime       = FORMAT_MIME[format] || "audio/mpeg";

  return new Response(fileBuffer, {
    headers: {
      "Content-Type":        mime,
      "Content-Disposition": `attachment; filename="master_${masterId}.${ext}"`,
      "Content-Length":      String(fileBuffer.length),
      "Cache-Control":       "private, no-store",
    },
  });
}
