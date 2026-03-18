"use client";

/**
 * ReferenceTrack — Upload a professional reference track.
 * The app will AI-match loudness, tonal balance and dynamics to it.
 */

import { useRef, useState, useEffect } from "react";

interface ReferenceAnalysis {
  integrated_lufs:   number;
  true_peak:         number;
  spectral_centroid: number;
  spectral_rolloff:  number;
  spectral_flatness: number;
  rms_sub: number; rms_low: number; rms_mid: number; rms_high: number; rms_air: number;
}

interface Props {
  onReference: (analysis: ReferenceAnalysis | null, filename: string | null) => void;
}

function ReferencePopup({
  analysis,
  filename,
  onClose,
}: {
  analysis: ReferenceAnalysis;
  filename: string;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const bands = [
    { label: "Sub",  range: "20–80 Hz",    value: analysis.rms_sub,  color: "#a855f7" },
    { label: "Low",  range: "80–500 Hz",   value: analysis.rms_low,  color: "#00e5c4" },
    { label: "Mid",  range: "500–5k Hz",   value: analysis.rms_mid,  color: "#3b82f6" },
    { label: "High", range: "5–12k Hz",    value: analysis.rms_high, color: "#f59e0b" },
    { label: "Air",  range: "12–20k Hz",   value: analysis.rms_air,  color: "#ec4899" },
  ];

  // Normalise band bars: map –60…–6 dB range to 0–100%
  const toBar = (db: number) => Math.max(0, Math.min(100, ((db + 60) / 54) * 100));

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        animation: "fadeIn 0.18s ease",
      }}
    >
      {/* Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "linear-gradient(160deg, rgba(18,22,30,0.98) 0%, rgba(12,16,24,0.98) 100%)",
          border: "1px solid rgba(245,200,66,0.3)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
          animation: "popUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Header bar */}
        <div style={{
          padding: "1rem 1.25rem 0.875rem",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(245,200,66,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.1rem" }}>🎛</span>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--accent-gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
                Referenz-Analyse
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.1rem", maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {filename}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Metrics grid */}
        <div style={{ padding: "1.1rem 1.25rem 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.625rem", marginBottom: "1.1rem" }}>
            {[
              { label: "Integrated",  value: `${analysis.integrated_lufs.toFixed(1)} LUFS`, color: "var(--accent-purple)" },
              { label: "True Peak",   value: `${analysis.true_peak.toFixed(1)} dBTP`,        color: "var(--accent-cyan)" },
              { label: "Centroid",    value: `${Math.round(analysis.spectral_centroid)} Hz`,  color: "#f59e0b" },
              { label: "Rolloff",     value: `${Math.round(analysis.spectral_rolloff)} Hz`,   color: "var(--accent-cyan)" },
              { label: "Flatness",    value: analysis.spectral_flatness.toFixed(3),           color: "var(--accent-purple)" },
            ].map((m) => (
              <div key={m.label} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                padding: "0.65rem 0.75rem",
              }}>
                <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                  {m.label}
                </div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: m.color, fontVariantNumeric: "tabular-nums" }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Frequency band bars */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "10px",
            padding: "0.875rem",
            marginBottom: "1.1rem",
          }}>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 600 }}>
              Frequency Band Energy
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {bands.map((b) => (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "30px", fontSize: "0.68rem", color: b.color, fontWeight: 600, flexShrink: 0 }}>{b.label}</div>
                  <div style={{ flex: 1, height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{
                      width: `${toBar(b.value)}%`,
                      height: "100%",
                      borderRadius: "3px",
                      background: `linear-gradient(90deg, ${b.color}99, ${b.color})`,
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                  <div style={{ width: "52px", textAlign: "right", fontSize: "0.68rem", color: "var(--text-muted)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                    {b.value.toFixed(1)} dB
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "0.75rem 1.25rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            KI matcht Loudness · Spektrum · Dynamik
          </span>
          <button
            onClick={onClose}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "7px",
              background: "rgba(245,200,66,0.12)",
              border: "1px solid rgba(245,200,66,0.3)",
              color: "var(--accent-gold)",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            OK
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popUp  { from { opacity: 0; transform: scale(0.88) translateY(10px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      `}</style>
    </div>
  );
}

export default function ReferenceTrack({ onReference }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename]           = useState<string | null>(null);
  const [error, setError]                 = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis]   = useState<ReferenceAnalysis | null>(null);
  const [popupData, setPopupData]         = useState<{ analysis: ReferenceAnalysis; filename: string } | null>(null);

  // Progress tracking
  const [phase, setPhase]                 = useState<"idle" | "upload" | "analyze">("idle");
  const [uploadPct, setUploadPct]         = useState(0);
  const [analyzePct, setAnalyzePct]       = useState(0);

  const handleFile = async (file: File) => {
    setError(null);
    setPhase("upload");
    setUploadPct(0);
    setAnalyzePct(0);

    try {
      // --- Upload via XHR for real progress ---
      const form = new FormData();
      form.append("file", file);
      const { file_id } = await new Promise<{ file_id: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadPct(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
          else reject(new Error("Upload failed"));
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.open("POST", "/api/upload");
        xhr.send(form);
      });
      setUploadPct(100);

      // --- Analyse with simulated progress ---
      setPhase("analyze");
      const analyzeTimer = setInterval(() => {
        setAnalyzePct((p) => (p < 88 ? p + (88 - p) * 0.14 : p));
      }, 250);

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id }),
      });
      clearInterval(analyzeTimer);
      if (!analyzeRes.ok) throw new Error("Analysis failed");
      setAnalyzePct(100);

      const analysis: ReferenceAnalysis = await analyzeRes.json();
      setPhase("idle");
      setFilename(file.name);
      setLastAnalysis(analysis);
      setPopupData({ analysis, filename: file.name });
      onReference(analysis, file.name);
    } catch (e) {
      setError("Referenz-Track konnte nicht analysiert werden");
      setPhase("idle");
      console.warn(e);
    }
  };

  const handleClear = () => {
    setFilename(null);
    setError(null);
    setPopupData(null);
    setLastAnalysis(null);
    onReference(null, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      {popupData && (
        <ReferencePopup
          analysis={popupData.analysis}
          filename={popupData.filename}
          onClose={() => setPopupData(null)}
        />
      )}

      <div
        className="glass-panel p-3"
        style={{ border: "1px solid rgba(245,200,66,0.15)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="label">Reference Track</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {filename && (
              <button
                onClick={() => lastAnalysis && setPopupData({ analysis: lastAnalysis, filename: filename! })}
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: "var(--accent-gold)" }}
                title="Analyse anzeigen"
              >
                📊
              </button>
            )}
            {filename && (
              <button
                onClick={handleClear}
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: "var(--text-muted)" }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {!filename ? (
          phase !== "idle" ? (
            /* ---- Progress UI ---- */
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", padding: "0.25rem 0" }}>
              {/* Row: Upload */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em", color: phase === "upload" ? "var(--accent-gold)" : "var(--text-muted)" }}>
                    {phase !== "upload" && <span style={{ color: "var(--accent-cyan)", marginRight: "0.25rem" }}>✓</span>}
                    UPLOAD
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "var(--accent-gold)", fontVariantNumeric: "tabular-nums" }}>
                    {uploadPct}%
                  </span>
                </div>
                <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${uploadPct}%`, borderRadius: "2px",
                    background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                    transition: "width 0.25s ease",
                    boxShadow: phase === "upload" ? "0 0 6px rgba(245,159,11,0.5)" : "none",
                  }} />
                </div>
              </div>
              {/* Row: Analyse */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em", color: phase === "analyze" ? "var(--accent-cyan)" : "var(--text-muted)" }}>
                    ANALYSE
                  </span>
                  {phase === "analyze" && (
                    <span style={{ fontSize: "0.65rem", color: "var(--accent-cyan)", fontVariantNumeric: "tabular-nums" }}>
                      {Math.round(analyzePct)}%
                    </span>
                  )}
                </div>
                <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${analyzePct}%`, borderRadius: "2px",
                    background: "linear-gradient(90deg, var(--accent-cyan), #67e8f9)",
                    transition: "width 0.35s ease",
                    boxShadow: phase === "analyze" ? "0 0 6px rgba(0,229,196,0.5)" : "none",
                  }} />
                </div>
              </div>
            </div>
          ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all hover:opacity-80"
            style={{
              background: "rgba(245,200,66,0.06)",
              border:     "1px dashed rgba(245,200,66,0.3)",
              color:      "var(--accent-gold)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload reference (WAV / MP3)
          </button>
          )
        ) : (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(245,200,66,0.08)",
              border:     "1px solid rgba(245,200,66,0.25)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span className="text-xs font-medium truncate" style={{ color: "var(--accent-gold)" }}>
              {filename}
            </span>
            <span className="text-xs ml-auto flex-shrink-0" style={{ color: "var(--text-muted)" }}>
              KI matcht diesen
            </span>
          </div>
        )}

        {error && (
          <p className="text-xs mt-1.5" style={{ color: "var(--accent-red)" }}>{error}</p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".wav,.mp3,.flac,.aiff,.aif,.m4a,.ogg"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
    </>
  );
}
