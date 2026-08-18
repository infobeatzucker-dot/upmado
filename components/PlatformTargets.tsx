"use client";

import { Platform } from "@/app/page";
import { useState } from "react";

const PLATFORMS: { id: Platform; label: string; lufs: string; icon: string }[] = [
  { id: "spotify",    label: "Spotify",      lufs: "−14 LUFS", icon: "S" },
  { id: "apple",      label: "Apple Music",  lufs: "−16 LUFS", icon: "♪" },
  { id: "youtube",    label: "YouTube",      lufs: "−14 LUFS", icon: "▶" },
  { id: "tidal",      label: "Tidal",        lufs: "−14 LUFS", icon: "◇" },
  { id: "amazon",     label: "Amazon Music", lufs: "−14 LUFS", icon: "A" },
  { id: "deezer",     label: "Deezer",       lufs: "−15 LUFS", icon: "D" },
  { id: "tiktok",     label: "TikTok",       lufs: "−13 LUFS", icon: "T" },
  { id: "soundcloud", label: "SoundCloud",   lufs: "−8 LUFS",  icon: "☁" },
  { id: "club",       label: "Club / DJ",    lufs: "−9 LUFS",  icon: "C" },
  { id: "broadcast",  label: "Broadcast/TV", lufs: "−23 LUFS", icon: "▣" },
  { id: "custom",     label: "Custom",       lufs: "Manual",   icon: "⌁" },
];

interface Props {
  value: Platform;
  onChange: (p: Platform) => void;
  lang?: "de" | "en";
}

export default function PlatformTargets({ value, onChange, lang = "de" }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visiblePlatforms = expanded
    ? PLATFORMS
    : PLATFORMS.filter((platform, index) => index < 6 || platform.id === value);

  return (
    <div className="precision-picker">
      <div className="precision-picker-heading"><span>{lang === "de" ? "Plattform-Ziel" : "Platform Target"}</span><small>{lang === "de" ? "Streaming-Lautheit" : "Streaming loudness"}</small></div>
      <div className="precision-platform-grid">
        {visiblePlatforms.map((p) => {
          const active = value === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onChange(p.id)}
              className={`precision-platform-tile ${active ? "active" : ""}`}
              style={{
                background: active ? "rgba(124,111,255,0.2)" : "rgba(20,24,32,0.8)",
                border: active ? "1px solid var(--accent-purple)" : "1px solid var(--border-subtle)",
                color: active ? "var(--accent-purple)" : "var(--text-secondary)",
                boxShadow: active ? "0 0 10px rgba(124,111,255,0.2)" : "none",
              }}
            >
              <span className="precision-platform-mark">{p.icon}</span>
              <strong>{p.label}</strong>
              <span
                className="mono"
                style={{
                  fontSize: "10px",
                  color: active ? "var(--accent-cyan)" : "var(--text-muted)",
                }}
              >
                {p.lufs}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          className="precision-options-toggle"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
        >
          <span>{expanded ? "−" : "+"}</span>
          {expanded
            ? (lang === "de" ? "Weniger anzeigen" : "Show less")
            : (lang === "de" ? "Weitere Plattformen" : "More platforms")}
        </button>
      </div>
    </div>
  );
}
