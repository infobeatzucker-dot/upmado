"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MasterData } from "@/app/page";
import ABPlayer from "./ABPlayer";

const PayPalDownloadButton = dynamic(
  () => import("./PayPalButton").then((m) => m.PayPalDownloadButton),
  { ssr: false }
);

interface Props {
  masterData:  MasterData;
  fileId:      string;
  filename:    string;
  platform:    string;
  preset:      string;
  intensity:   number;
  preAnalysis: import("@/app/page").AnalysisData;
  onReset:     () => void;
}

const FORMAT_CONFIG = [
  { key: "wav32",  label: "WAV 32-bit Float", desc: "Highest quality", tier: "pro",  ext: "wav" },
  { key: "wav24",  label: "WAV 24-bit",        desc: "Studio quality",  tier: "paid", ext: "wav" },
  { key: "wav16",  label: "WAV 16-bit",        desc: "CD quality",      tier: "paid", ext: "wav" },
  { key: "flac",   label: "FLAC",              desc: "Lossless",        tier: "paid", ext: "flac" },
  { key: "mp3320", label: "MP3 320kbps",       desc: "High quality",    tier: "paid", ext: "mp3" },
  { key: "mp3128", label: "MP3 128kbps",       desc: "Free tier",       tier: "free", ext: "mp3" },
  { key: "aac256", label: "AAC 256kbps",       desc: "Streaming",       tier: "paid", ext: "m4a" },
] as const;

type FormatKey = keyof MasterData["formats"];

export default function DownloadPanel({ masterData, fileId, filename, platform, preset, intensity, preAnalysis, onReset }: Props) {
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const [showPayPal,    setShowPayPal]    = useState(false);

  const openReport = () => {
    const payload = {
      filename,
      platform,
      preset,
      intensity,
      pre:   preAnalysis,
      post:  masterData.post_analysis,
      notes: masterData.notes,
      date:  new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" }),
    };
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    window.open(`/api/report?data=${b64}`, "_blank");
  };

  const handleDownload = (format: string, url: string) => {
    const finalUrl = downloadToken ? `${url}&token=${downloadToken}` : url;
    const a = document.createElement("a");
    a.href = finalUrl;
    a.download = `master_${masterData.master_id}.${format}`;
    a.click();
  };

  return (
    <div className="mt-6">
      {/* A/B Comparison Player — URLs are provided via AudioEngineContext */}
      <ABPlayer filename={filename} />

      {/* Success Banner */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{
          background: "linear-gradient(135deg, rgba(0,229,196,0.08), rgba(124,111,255,0.08))",
          border: "1px solid rgba(0,229,196,0.25)",
        }}
      >
        <div className="flex items-start gap-3">
          {/* Checkmark */}
          <div
            className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
            style={{ background: "rgba(0,229,196,0.15)", border: "1px solid rgba(0,229,196,0.35)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5c4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--accent-cyan)" }}>
              Mastering complete
            </div>
            <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {masterData.notes}
            </div>
          </div>
        </div>
      </div>

      {/* Report button row */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
          style={{
            background: "rgba(124,111,255,0.08)",
            border: "1px solid rgba(124,111,255,0.25)",
            color: "var(--accent-purple)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          Mastering Report (PDF)
        </button>
      </div>

      {/* Download Options */}
      <div className="label mb-3">Download Formats</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {FORMAT_CONFIG.map((fmt) => {
          const url = masterData.formats[fmt.key as FormatKey];
          const isLocked = fmt.tier !== "free" && !url;
          const isFree = fmt.tier === "free";

          return (
            <button
              key={fmt.key}
              onClick={() => !isLocked && url && handleDownload(fmt.ext, url)}
              disabled={isLocked}
              className="flex items-center justify-between p-3 rounded-xl transition-all text-left"
              style={{
                background: isLocked
                  ? "rgba(14,17,23,0.4)"
                  : "rgba(124,111,255,0.08)",
                border: isLocked
                  ? "1px solid var(--border-subtle)"
                  : "1px solid rgba(124,111,255,0.2)",
                opacity: isLocked ? 0.5 : 1,
                cursor: isLocked ? "not-allowed" : "pointer",
              }}
            >
              <div>
                <div className="text-sm font-medium" style={{ color: isLocked ? "var(--text-muted)" : "var(--text-primary)" }}>
                  {fmt.label}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {fmt.desc}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {isFree && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      background: "rgba(0,229,196,0.1)",
                      color: "var(--accent-cyan)",
                      border: "1px solid rgba(0,229,196,0.2)",
                    }}
                  >
                    FREE
                  </span>
                )}
                {fmt.tier === "pro" && (
                  <span className="text-xs tier-pro border rounded px-1.5 py-0.5">PRO</span>
                )}
                {isLocked ? (
                  <span style={{ color: "var(--text-muted)", fontSize: 14 }}>🔒</span>
                ) : (
                  <span style={{ color: "var(--accent-purple)", fontSize: 14 }}>↓</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Pay-per-Download section */}
      {!downloadToken && (
        <div
          className="mt-4 p-4 rounded-xl"
          style={{
            background: "rgba(245,200,66,0.05)",
            border: "1px solid rgba(245,200,66,0.15)",
          }}
        >
          {showPayPal ? (
            <div>
              <div className="label mb-3 text-center" style={{ color: "var(--accent-gold)" }}>
                Pay €2.99 to unlock all formats
              </div>
              <PayPalDownloadButton
                masterId={masterData.master_id}
                onSuccess={(token) => {
                  setDownloadToken(token);
                  setShowPayPal(false);
                }}
              />
              <button
                onClick={() => setShowPayPal(false)}
                className="w-full mt-2 text-xs py-1"
                style={{ color: "var(--text-muted)" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-sm text-center sm:text-left" style={{ color: "var(--text-secondary)" }}>
                Get all formats with{" "}
                <span className="font-semibold" style={{ color: "var(--accent-gold)" }}>
                  Pay-per-Download (€2.99)
                </span>
                {" "}or{" "}
                <a href="/pricing" className="font-semibold hover:opacity-80" style={{ color: "var(--accent-gold)" }}>
                  subscribe for unlimited
                </a>
              </span>
              <button
                onClick={() => setShowPayPal(true)}
                className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, var(--accent-gold), #e8a000)",
                  color: "#000",
                }}
              >
                Unlock all formats
              </button>
            </div>
          )}
        </div>
      )}

      {downloadToken && (
        <div
          className="mt-4 p-3 rounded-xl text-center text-sm"
          style={{
            background: "rgba(0,229,196,0.08)",
            border: "1px solid rgba(0,229,196,0.2)",
            color: "var(--accent-cyan)",
          }}
        >
          ✓ All formats unlocked · Download link valid for 7 days
        </div>
      )}
    </div>
  );
}
