"use client";

import { useEffect, useRef } from "react";
import { Platform, Preset, MasterData, ProgressStep, AnalysisData } from "@/app/page";

interface Props {
  fileId: string;
  platform: Platform;
  preset: Preset;
  intensity: number;          // 0–100
  selectedFormat: string;
  analysis?: AnalysisData;    // pre-computed analysis — passed to Python to skip librosa re-run
  isProcessing: boolean;
  onStart: () => void;
  onProgress: (step: ProgressStep) => void;
  onComplete: (data: MasterData) => void;
  onError: () => void;
  compact?: boolean;          // compact layout for sticky popup (no hint text, smaller button)
}

const STEP_LABELS: Record<string, string> = {
  analyzing:   "Analyzing track…",
  eq:          "Applying EQ correction…",
  compression: "Multiband compression…",
  ms:          "M/S processing…",
  saturation:  "Harmonic saturation…",
  limiting:    "True Peak limiting…",
  rendering:   "Rendering all formats…",
  complete:    "Mastering complete!",
};

export default function MasterButton({
  fileId, platform, preset, intensity, selectedFormat,
  analysis,
  isProcessing, onStart, onProgress, onComplete, onError,
  compact = false,
}: Props) {
  const particleContainerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const handleClickRef = useRef<() => void>(() => {});

  // Particles while processing
  useEffect(() => {
    if (!isProcessing || !particleContainerRef.current) return;
    const interval = setInterval(() => {
      const container = particleContainerRef.current;
      if (!container) return;
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = `${20 + Math.random() * 60}%`;
      particle.style.bottom = "0";
      particle.style.background = Math.random() > 0.5 ? "var(--accent-cyan)" : "var(--accent-purple)";
      const sz = `${2 + Math.random() * 4}px`;
      particle.style.width = sz; particle.style.height = sz;
      particle.style.animationDuration = `${0.8 + Math.random() * 0.8}s`;
      container.appendChild(particle);
      setTimeout(() => particle.remove(), 1600);
    }, 150);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleClick = async () => {
    if (isProcessing) return;
    onStart();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: fileId, platform, preset, intensity, format: selectedFormat, analysis }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) { onError(); return; }

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processChunk = (chunk: string): boolean => {
        const line = chunk.trim();
        if (!line.startsWith("data: ")) return false;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.step === "complete") { onComplete(data as MasterData); return true; }
          if (data.error)               { onError(); return true; }
          onProgress({ step: data.step, label: STEP_LABELS[data.step] || data.label || data.step, progress: data.progress ?? 0 });
        } catch { /* ignore malformed */ }
        return false;
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          if (buffer.trim()) for (const chunk of buffer.split("\n\n")) if (processChunk(chunk)) return;
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";
        for (const chunk of chunks) if (processChunk(chunk)) return;
      }
      onError();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      onError();
    }
  };

  // Keep ref in sync so keyboard shortcut can call latest version
  handleClickRef.current = handleClick;

  // ── Keyboard shortcut: M → master now ──────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.key === "m" || e.key === "M") && !isProcessing) {
        handleClickRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isProcessing]);

  useEffect(() => { return () => abortRef.current?.abort(); }, []);

  return (
    <div className={`flex flex-col items-center gap-4 ${compact ? "" : "mt-6"}`}>
      <div className="relative overflow-hidden rounded-2xl" ref={compact ? undefined : particleContainerRef}>
        <button
          onClick={handleClick}
          disabled={isProcessing}
          className={`gradient-border relative ${compact ? "px-8 py-3" : "px-12 py-4"} rounded-2xl font-bold text-base tracking-wide transition-all duration-300
            ${isProcessing ? "opacity-80 cursor-wait" : "hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"}`}
          style={{
            background: isProcessing
              ? "linear-gradient(135deg, rgba(124,111,255,0.3), rgba(0,229,196,0.3))"
              : "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))",
            color: "#fff", border: "none",
            boxShadow: isProcessing
              ? "0 0 40px rgba(124,111,255,0.4), 0 0 80px rgba(0,229,196,0.2)"
              : "0 0 20px rgba(124,111,255,0.3)",
            minWidth: compact ? 160 : 240,
          }}
        >
          {isProcessing ? (
            <span className="flex items-center gap-3 justify-center">
              <span className="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                style={{ borderTopColor: "rgba(255,255,255,0.8)", borderRightColor: "rgba(255,255,255,0.4)" }} />
              Mastering…
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              ▶ MASTER NOW
              {!compact && (
                <kbd className="text-xs px-1.5 py-0.5 rounded mono opacity-60"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", fontSize: 10 }}>
                  M
                </kbd>
              )}
            </span>
          )}
        </button>
      </div>

      {!isProcessing && !compact && (
        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
          Professionelle Mastering-Chain · KI-Parameterwahl · Format: <span style={{ color: "var(--accent-cyan)" }}>{selectedFormat.toUpperCase()}</span>
        </p>
      )}
    </div>
  );
}
