"use client";

const FEATURES = [
  {
    icon: "🧠",
    title: "AI Analysis",
    desc: "KI analysiert Genre, Energie, Dynamik und Spektralbalance deines Tracks — und wählt automatisch die optimalen Mastering-Parameter.",
    details: ["Genre detection", "Spectral analysis", "Dynamic range measurement", "BPM & key detection"],
    color: "var(--accent-purple)",
  },
  {
    icon: "⚙️",
    title: "Professional Chain",
    desc: "12-stage mastering chain using Spotify's Pedalboard, pyloudnorm (ITU-R BS.1770-4), and multiband compression — the same tools used by top engineers.",
    details: ["Correction EQ", "Multiband compression", "M/S processing", "True Peak limiting"],
    color: "var(--accent-cyan)",
  },
  {
    icon: "📦",
    title: "All Formats",
    desc: "Download your master in every professional format. WAV 32-bit float for archiving, MP3 for streaming, or FLAC for distribution.",
    details: ["WAV 32/24/16 bit", "FLAC lossless", "MP3 320kbps", "AAC 256kbps"],
    color: "var(--accent-gold)",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="label mb-3">How it works</div>
        <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Professional mastering. Zero setup.
        </h2>
        <p className="text-base max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
          The same processing chain used in professional studios, accessible in one click.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="glass-panel p-6 hover:border-opacity-50 transition-all">
            <div
              className="text-3xl mb-4 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `${feature.color}15`,
                border: `1px solid ${feature.color}30`,
              }}
            >
              {feature.icon}
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              {feature.title}
            </h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {feature.desc}
            </p>
            <ul className="space-y-1">
              {feature.details.map((d) => (
                <li key={d} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span style={{ color: feature.color }}>✓</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Processing Steps */}
      <div className="mt-12 glass-panel p-6">
        <div className="label mb-4 text-center">Mastering Chain</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            "DC Offset Removal",
            "Pre-Analysis",
            "AI Parameters",
            "Correction EQ",
            "Multiband Comp",
            "M/S Processing",
            "Stereo Enhancement",
            "Saturation",
            "Final EQ",
            "Bus Compression",
            "True Peak Limiter",
            "Dithering + Export",
          ].map((step, i) => (
            <div key={step} className="flex items-center gap-1">
              <span
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <span style={{ color: "var(--accent-purple)", fontSize: 9 }}>
                  {(i + 1).toString().padStart(2, "0")}
                </span>{" "}
                {step}
              </span>
              {i < 11 && (
                <span style={{ color: "var(--text-muted)", fontSize: 10 }}>›</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
