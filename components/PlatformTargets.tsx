"use client";

import { Platform } from "@/app/page";

const PLATFORMS: { id: Platform; label: string; lufs: string; icon: string }[] = [
  { id: "spotify",    label: "Spotify",      lufs: "−14 LUFS", icon: "🎵" },
  { id: "apple",      label: "Apple Music",  lufs: "−16 LUFS", icon: "🍎" },
  { id: "youtube",    label: "YouTube",      lufs: "−14 LUFS", icon: "▶" },
  { id: "tidal",      label: "Tidal",        lufs: "−14 LUFS", icon: "🌊" },
  { id: "amazon",     label: "Amazon Music", lufs: "−14 LUFS", icon: "📦" },
  { id: "deezer",     label: "Deezer",       lufs: "−15 LUFS", icon: "🎶" },
  { id: "tiktok",     label: "TikTok",       lufs: "−13 LUFS", icon: "📱" },
  { id: "soundcloud", label: "SoundCloud",   lufs: "−8 LUFS",  icon: "☁️" },
  { id: "club",       label: "Club / DJ",    lufs: "−9 LUFS",  icon: "🎛" },
  { id: "broadcast",  label: "Broadcast/TV", lufs: "−23 LUFS", icon: "📺" },
  { id: "custom",     label: "Custom",       lufs: "Manual",   icon: "⚙" },
];

interface Props {
  value: Platform;
  onChange: (p: Platform) => void;
}

export default function PlatformTargets({ value, onChange }: Props) {
  return (
    <div>
      <div className="label mb-2">Platform Target</div>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => {
          const active = value === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onChange(p.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: active ? "rgba(124,111,255,0.2)" : "rgba(20,24,32,0.8)",
                border: active ? "1px solid var(--accent-purple)" : "1px solid var(--border-subtle)",
                color: active ? "var(--accent-purple)" : "var(--text-secondary)",
                boxShadow: active ? "0 0 10px rgba(124,111,255,0.2)" : "none",
              }}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
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
      </div>
    </div>
  );
}
