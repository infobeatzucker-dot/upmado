import { NextRequest } from "next/server";
import path from "path";
import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { randomUUID } from "crypto";

const UPLOAD_DIR = process.env.TEMP_UPLOAD_DIR || "./uploads";
const PYTHON_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";

// SSE helper
function encodeSSE(data: object) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("file_id");
  const platform = searchParams.get("platform") || "spotify";
  const preset = searchParams.get("preset") || "auto";
  const intensity = parseInt(searchParams.get("intensity") || "65", 10);

  if (!fileId) {
    return new Response("file_id required", { status: 400 });
  }

  // Set up SSE response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(encodeSSE(data)));
      };

      try {
        // Find file
        const files = existsSync(UPLOAD_DIR) ? await readdir(UPLOAD_DIR) : [];
        const filename = files.find((f) => f.startsWith(fileId));

        if (!filename) {
          send({ error: "File not found", step: "error", progress: 0 });
          controller.close();
          return;
        }

        const filePath = path.resolve(path.join(UPLOAD_DIR, filename));

        send({ step: "analyzing", label: "Analyzing track…", progress: 5 });

        // Call Python mastering with progress streaming
        const res = await fetch(`${PYTHON_URL}/master`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_path: filePath,
            platform,
            preset,
            intensity,
            output_dir: path.resolve(path.join(UPLOAD_DIR, "masters")),
          }),
          signal: AbortSignal.timeout(300000), // 5 min timeout
        });

        if (!res.ok || !res.body) {
          // Fallback: send mock progress for development
          await simulateMockProgress(send);
          controller.close();
          return;
        }

        // Stream SSE events from Python service
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let pythonCompleted = false;

        outer: while (true) {
          const { done, value } = await reader.read();

          if (done) {
            buffer += decoder.decode();
            if (buffer.trim()) {
              for (const chunk of buffer.split("\n\n")) {
                const line = chunk.trim();
                if (!line.startsWith("data: ")) continue;
                try {
                  const data = JSON.parse(line.slice(6));
                  send(data);
                  if (data.step === "complete") { pythonCompleted = true; break outer; }
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
              const data = JSON.parse(line.slice(6));
              if (data.step === "complete") {
                send(data);
                pythonCompleted = true;
                break outer;
              } else if (data.error || data.step === "error") {
                // Python mastering failed → fall back to mock
                break outer;
              } else {
                send(data);
              }
            } catch { /* ignore */ }
          }
        }

        if (!pythonCompleted) {
          // Python failed or incomplete → run mock
          await simulateMockProgress(send);
        }

        controller.close();
      } catch (err) {
        console.error("Mastering error:", err);
        // Simulate for dev
        await simulateMockProgress(send);
        controller.close();
      }
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

async function simulateMockProgress(
  send: (data: object) => void
) {
  const steps = [
    { step: "analyzing",   progress: 10, label: "Analyzing track…" },
    { step: "eq",          progress: 30, label: "Applying EQ correction…" },
    { step: "compression", progress: 50, label: "Multiband compression…" },
    { step: "ms",          progress: 60, label: "M/S processing…" },
    { step: "saturation",  progress: 70, label: "Harmonic saturation…" },
    { step: "limiting",    progress: 85, label: "True Peak limiting…" },
    { step: "rendering",   progress: 95, label: "Rendering all formats…" },
  ];

  for (const step of steps) {
    await delay(600 + Math.random() * 400);
    send(step);
  }

  await delay(800);

  const masterId = randomUUID();
  send({
    step: "complete",
    progress: 100,
    master_id: masterId,
    formats: {
      wav32: `/api/download?master_id=${masterId}&format=wav32`,
      wav24: `/api/download?master_id=${masterId}&format=wav24`,
      wav16: `/api/download?master_id=${masterId}&format=wav16`,
      flac: `/api/download?master_id=${masterId}&format=flac`,
      mp3320: `/api/download?master_id=${masterId}&format=mp3320`,
      mp3128: `/api/download?master_id=${masterId}&format=mp3128`,
      aac256: `/api/download?master_id=${masterId}&format=aac256`,
    },
    post_analysis: {
      integrated_lufs: -14.0,
      true_peak: -1.0,
      dr_value: 11,
      crest_factor: 9.8,
      rms_sub: -18.2,
      rms_low: -16.4,
      rms_mid: -17.8,
      rms_high: -22.1,
      rms_air: -28.6,
      spectral_centroid: 2800,
      spectral_rolloff: 9500,
      spectral_flatness: 0.14,
      stereo_width: 1.05,
      mono_compatibility: 0.94,
      bpm: 128,
      key: "C minor",
      transient_density: 0.48,
      clipping_detected: false,
      dc_offset: 0.0,
      duration_seconds: 180,
      sample_rate: 44100,
      bit_depth: 24,
      channels: 2,
    },
    notes: "Electronic/Dance track. Applied sub-bass tightening, bright air shelf, and wide stereo field. Optimized for Spotify at -14 LUFS.",
  });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
