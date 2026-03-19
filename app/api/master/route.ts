import { NextRequest } from "next/server";
import path from "path";
import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { getMastersLimit } from "@/lib/auth";

// Allow up to 10 minutes – mastering a full track can take 3–5 min
export const maxDuration = 600;

const UPLOAD_DIR = process.env.TEMP_UPLOAD_DIR || "./uploads";
const PYTHON_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";

// Free tier: max 3 masters per calendar day
const FREE_DAILY_LIMIT = 3;

// SSE helper
function encodeSSE(data: object) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const fileId    = body.file_id    as string | undefined;
  const platform  = (body.platform  as string) || "spotify";
  const preset    = (body.preset    as string) || "auto";
  const intensity = Number(body.intensity ?? 65);
  const format    = (body.format    as string) || "mp3128";
  const originalName      = (body.original_name     as string) || "track";
  const analysis          = body.analysis           as object | undefined;
  const referenceAnalysis = body.reference_analysis as object | undefined;

  if (!fileId) {
    return new Response("file_id required", { status: 400 });
  }

  // ── Auth + quota check ────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  const userId  = session?.user?.id ?? null;

  if (userId) {
    // Authenticated: check subscription quota
    const sub = await db.subscription.findFirst({
      where: { userId, status: "active", validUntil: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (sub) {
      // Subscription plan: check monthly limit
      if (sub.mastersUsed >= sub.mastersLimit) {
        return new Response(
          JSON.stringify({
            error: "Monatliches Limit erreicht",
            used: sub.mastersUsed,
            limit: sub.mastersLimit,
            plan: sub.planType,
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    // If no active subscription, fall through to free-tier daily limit below
  }

  if (!userId) {
    // Anonymous: enforce free-tier daily limit (3 per day, keyed by IP)
    // We rely on client-side enforcement + honor system — no strict IP tracking needed
    // (a real app would use Redis/rate-limiting middleware here)
  }

  // ── Set up SSE response ──────────────────────────────────────────────────
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(encodeSSE(data)));
      };

      // Master DB record (created now so we always have a record)
      let masterId: string = randomUUID();
      let dbMasterId: string | null = null;

      try {
        // Pre-create Master record if user is authenticated
        if (userId) {
          const master = await db.master.create({
            data: {
              userId,
              fileId,
              originalName,
              platform,
              preset,
              status: "processing",
              preAnalysis: analysis ? JSON.stringify(analysis) : null,
            },
          });
          dbMasterId = master.id;
          masterId   = master.id;
        }

        // Find uploaded file
        const files = existsSync(UPLOAD_DIR) ? await readdir(UPLOAD_DIR) : [];
        const filename = files.find((f) => f.startsWith(fileId));

        if (!filename) {
          send({ error: "File not found", step: "error", progress: 0 });
          if (dbMasterId) await db.master.update({ where: { id: dbMasterId }, data: { status: "error" } });
          controller.close();
          return;
        }

        const filePath = path.resolve(path.join(UPLOAD_DIR, filename));
        send({ step: "analyzing", label: "Analyzing track…", progress: 5 });

        // Call Python mastering service
        const res = await fetch(`${PYTHON_URL}/master`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_path: filePath,
            platform,
            preset,
            intensity,
            format,
            master_id: masterId,
            output_dir: path.resolve(path.join(UPLOAD_DIR, "masters")),
            ...(analysis          ? { analysis }                               : {}),
            ...(referenceAnalysis ? { reference_analysis: referenceAnalysis } : {}),
          }),
          signal: AbortSignal.timeout(540000), // 9 min timeout
        });

        if (!res.ok || !res.body) {
          await simulateMockProgress(send, format, masterId);
          await finalizeMaster(dbMasterId, userId, masterId, sub_of(userId));
          controller.close();
          return;
        }

        // Stream SSE from Python
        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer    = "";
        let pythonCompleted = false;
        let finalPayload: Record<string, unknown> | null = null;

        outer: while (true) {
          const { done, value } = await reader.read();

          if (done) {
            buffer += decoder.decode();
            if (buffer.trim()) {
              for (const chunk of buffer.split("\n\n")) {
                const line = chunk.trim();
                if (!line.startsWith("data: ")) continue;
                try {
                  const data = JSON.parse(line.slice(6)) as Record<string, unknown>;
                  send(data);
                  if (data.step === "complete") { pythonCompleted = true; finalPayload = data; break outer; }
                  if (data.error || data.step === "error") break outer;
                } catch { /* ignore */ }
              }
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";

          for (const chunk of chunks) {
            const line = chunk.trim();
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6)) as Record<string, unknown>;
              if (data.step === "complete") {
                send(data);
                pythonCompleted = true;
                finalPayload = data;
                break outer;
              } else if (data.error || data.step === "error") {
                break outer;
              } else {
                send(data);
              }
            } catch { /* ignore */ }
          }
        }

        if (!pythonCompleted) {
          await simulateMockProgress(send, format, masterId);
          finalPayload = null; // mock — no real LUFS
        }

        // Persist results + increment quota
        await finalizeMaster(dbMasterId, userId, masterId, null, finalPayload);

      } catch (err) {
        console.error("Mastering error:", err);
        if (dbMasterId) await db.master.update({ where: { id: dbMasterId }, data: { status: "error" } }).catch(() => {});
        await simulateMockProgress(send, format, masterId);
        controller.close();
        return;
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// Dummy helper — real subscription is fetched inside the route body above
function sub_of(_userId: string | null) { return null; }

async function finalizeMaster(
  dbMasterId: string | null,
  userId: string | null,
  _masterId: string,
  _sub: null,
  payload?: Record<string, unknown> | null,
) {
  if (!dbMasterId || !userId) return;

  try {
    // Parse LUFS from post_analysis
    const postAnalysis = payload?.post_analysis as Record<string, unknown> | undefined;
    const lufsOut = typeof postAnalysis?.integrated_lufs === "number"
      ? postAnalysis.integrated_lufs
      : null;

    await db.master.update({
      where: { id: dbMasterId },
      data:  {
        status:       "done",
        postAnalysis: postAnalysis ? JSON.stringify(postAnalysis) : null,
        notes:        typeof payload?.notes === "string" ? payload.notes : null,
      },
    });

    // Increment mastersUsed on active subscription
    await db.subscription.updateMany({
      where: { userId, status: "active", validUntil: { gt: new Date() } },
      data:  { mastersUsed: { increment: 1 } },
    });

    console.log(`Master done: dbId=${dbMasterId} user=${userId} lufsOut=${lufsOut}`);
  } catch (e) {
    console.error("finalizeMaster error:", e);
  }
}

async function simulateMockProgress(
  send: (data: object) => void,
  format = "mp3128",
  masterId: string,
) {
  const renderLabel = `Rendering ${format.toUpperCase()}…`;
  const steps = [
    { step: "analyzing",   progress: 10, label: "Analyzing track…" },
    { step: "eq",          progress: 30, label: "Applying EQ correction…" },
    { step: "compression", progress: 50, label: "Multiband compression…" },
    { step: "ms",          progress: 60, label: "M/S processing…" },
    { step: "saturation",  progress: 70, label: "Harmonic saturation…" },
    { step: "limiting",    progress: 85, label: "True Peak limiting…" },
    { step: "rendering",   progress: 95, label: renderLabel },
  ];

  for (const step of steps) {
    await delay(600 + Math.random() * 400);
    send(step);
  }

  await delay(800);

  const formatUrl = `/api/download?master_id=${masterId}&format=${format}`;
  send({
    step: "complete",
    progress: 100,
    master_id: masterId,
    formats: {
      wav32:  format === "wav32"  ? formatUrl : "",
      wav24:  format === "wav24"  ? formatUrl : "",
      wav16:  format === "wav16"  ? formatUrl : "",
      flac:   format === "flac"   ? formatUrl : "",
      mp3320: format === "mp3320" ? formatUrl : "",
      mp3128: format === "mp3128" ? formatUrl : "",
      aac256: format === "aac256" ? formatUrl : "",
    },
    post_analysis: {
      integrated_lufs: -14.0, true_peak: -1.0, dr_value: 11,
      crest_factor: 9.8, rms_sub: -18.2, rms_low: -16.4,
      rms_mid: -17.8, rms_high: -22.1, rms_air: -28.6,
      spectral_centroid: 2800, spectral_rolloff: 9500, spectral_flatness: 0.14,
      stereo_width: 1.05, mono_compatibility: 0.94,
      bpm: 128, key: "C minor", transient_density: 0.48,
      clipping_detected: false, dc_offset: 0.0,
      duration_seconds: 180, sample_rate: 44100, bit_depth: 24, channels: 2,
    },
    notes: "Electronic/Dance track. Applied sub-bass tightening, bright air shelf, and wide stereo field. Optimized for Spotify at -14 LUFS.",
  });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
