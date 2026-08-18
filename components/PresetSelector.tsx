"use client";

import { Preset } from "@/app/page";
import { useState } from "react";

const PRESETS: { id: Preset; label: string; emoji: string; desc: string }[] = [
  { id: "electronic", label: "Electronic",  emoji: "EL", desc: "Punchy, wide, loud" },
  { id: "hiphop",     label: "Hip-Hop",     emoji: "HH", desc: "Heavy low end" },
  { id: "trap",       label: "Trap / Drill", emoji: "TR", desc: "Hard 808s, crisp highs" },
  { id: "dance",      label: "Dance / House",emoji: "DH", desc: "Club-ready, pumping" },
  { id: "rock",       label: "Rock",         emoji: "RK", desc: "Dynamic, guitars" },
  { id: "metal",      label: "Metal",        emoji: "MT", desc: "Aggressive, powerful" },
  { id: "pop",        label: "Pop",          emoji: "PP", desc: "Polished, bright" },
  { id: "rnb",        label: "R&B / Soul",   emoji: "RB", desc: "Warm, smooth, groovy" },
  { id: "latin",      label: "Latin",        emoji: "LT", desc: "Vibrant, rhythmic" },
  { id: "country",    label: "Country",      emoji: "CN", desc: "Natural, warm" },
  { id: "jazz",       label: "Jazz",         emoji: "JZ", desc: "Natural, dynamic" },
  { id: "classical",  label: "Classical",    emoji: "CL", desc: "Wide, natural" },
  { id: "ambient",    label: "Ambient",      emoji: "AM", desc: "Spacious, cinematic" },
  { id: "techno",     label: "Techno",       emoji: "TC", desc: "Hard, industrial, punchy" },
  { id: "edm",        label: "EDM",          emoji: "ED", desc: "Festival-ready, massive" },
  { id: "lofi",       label: "Lo-Fi",        emoji: "LF", desc: "Warm, slightly compressed" },
  { id: "podcast",    label: "Podcast",      emoji: "PC", desc: "Voice optimized" },
];

interface Props {
  value: Preset;
  onChange: (p: Preset) => void;
  lang?: "de" | "en";
}

export default function PresetSelector({ value, onChange, lang = "de" }: Props) {
  const isAuto = value === "auto";
  const [expanded, setExpanded] = useState(false);
  const visiblePresets = expanded
    ? PRESETS
    : PRESETS.filter((preset, index) => index < 8 || preset.id === value);

  return (
    <div className="precision-picker precision-preset-picker">
      <div className="precision-picker-heading"><span>Genre-Preset</span><small>{lang === "de" ? "Klangcharakter" : "Sound character"}</small></div>

      {/* Auto AI — featured button */}
      <button
        onClick={() => onChange("auto")}
        className={`precision-auto-preset ${isAuto ? "active" : ""}`}
        style={{
          background: isAuto
            ? "linear-gradient(135deg, rgba(124,111,255,0.25), rgba(0,229,196,0.18))"
            : "rgba(124,111,255,0.07)",
          border: isAuto
            ? "1px solid rgba(124,111,255,0.7)"
            : "1px solid rgba(124,111,255,0.25)",
          color: isAuto ? "var(--accent-purple)" : "var(--text-secondary)",
          boxShadow: isAuto
            ? "0 0 20px rgba(124,111,255,0.25), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "none",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated glow sweep when active */}
        {isAuto && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(124,111,255,0.12) 50%, transparent 100%)",
              animation: "glow-sweep 2.5s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
        )}
        <span className="precision-ai-mark">AI</span>
        <span>Auto AI</span>
        <span
          className="text-xs px-1.5 py-0.5 rounded font-semibold"
          style={{
            background: isAuto ? "rgba(124,111,255,0.3)" : "rgba(124,111,255,0.12)",
            color: "var(--accent-purple)",
            border: "1px solid rgba(124,111,255,0.3)",
            letterSpacing: "0.05em",
          }}
        >
          {lang === "de" ? "Empfohlen" : "Recommended"}
        </span>
        {!isAuto && (
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginLeft: "auto" }}>
            {lang === "de" ? "Analysiert das Genre automatisch" : "Detects the genre automatically"}
          </span>
        )}
      </button>

      {/* Genre grid */}
      <div className="precision-preset-grid">
        {visiblePresets.map((p) => {
          const active = value === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onChange(p.id)}
              title={p.desc}
              className={`precision-preset-tile ${active ? "active" : ""}`}
              style={{
                background: active ? "rgba(0,229,196,0.15)" : "rgba(20,24,32,0.8)",
                border: active ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                color: active ? "var(--accent-cyan)" : "var(--text-secondary)",
                boxShadow: active ? "0 0 12px rgba(0,229,196,0.15)" : "none",
              }}
            >
              <span className="precision-preset-mark">{p.emoji}</span>
              <span>{p.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          className="precision-options-toggle precision-preset-toggle"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
        >
          <span>{expanded ? "−" : "+"}</span>
          {expanded
            ? (lang === "de" ? "Weniger anzeigen" : "Show less")
            : (lang === "de" ? "Weitere Genres" : "More genres")}
        </button>
      </div>
    </div>
  );
}
