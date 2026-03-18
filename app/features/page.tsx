import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Features – UpMaDo",
  description: "Alle Features von UpMaDo – KI-gestütztes Online-Mastering mit professioneller DSP-Pipeline.",
};

const features = [
  {
    icon: "🤖",
    color: "var(--accent-purple)",
    title: "KI-Parameterauswahl",
    description:
      "Unsere KI analysiert dein Audio und wählt automatisch die optimalen Mastering-Parameter: EQ-Korrekturen, Kompression, Stereobreite und Limiting — angepasst an Genre, Plattform und Dynamik.",
    tags: ["Auto AI", "Auto-Analyse", "Genre-aware"],
  },
  {
    icon: "🎚",
    color: "var(--accent-cyan)",
    title: "12-stufige DSP-Pipeline",
    description:
      "Professionelle Mastering-Chain: DC-Removal → Correction EQ → Multiband Compression → M/S Processing → Harmonic Saturation → Bus Compression → True Peak Limiting → LUFS-Normalisierung.",
    tags: ["EQ", "Multiband", "M/S", "Limiting"],
  },
  {
    icon: "🎯",
    color: "#f59e0b",
    title: "Mastering Intensity",
    description:
      "Steuere die Intensität des Masterings von 0% (transparent, kaum Eingriffe) bis 100% (maximales Processing). Alle DSP-Parameter skalieren intelligent mit — kein Pumpen, kein Übersteuern.",
    tags: ["0–100%", "Transparent", "Maximum"],
  },
  {
    icon: "🔊",
    color: "var(--accent-purple)",
    title: "Plattform-Loudness",
    description:
      "Spotify (–14 LUFS), Apple Music (–16 LUFS), YouTube (–14 LUFS), Club/DJ (–9 LUFS) und Custom-Target. True Peak Ceiling bei –1 dBTP für alle Plattformen.",
    tags: ["Spotify", "Apple Music", "YouTube", "Club"],
  },
  {
    icon: "🎵",
    color: "var(--accent-cyan)",
    title: "A/B-Vergleich Player",
    description:
      "Vergleiche Original (A) und Master (B) in Echtzeit. Nahtloses Umschalten ohne Unterbrechung. Live-Visualisierungen bewegen sich synchron zur Musik: Spektrum, Wellenform, Stereofeld, LUFS.",
    tags: ["Echtzeit", "Sync-Visualizer", "Live"],
  },
  {
    icon: "📊",
    color: "#f59e0b",
    title: "Erweiterte Analyse",
    description:
      "Vollständige Audioanalyse mit LUFS, True Peak, Dynamic Range, Crest Factor, BPM-Detection, Key-Detection, Spectral Centroid, Stereo Width, Mono Compatibility und Frequency Band Energy.",
    tags: ["LUFS", "DR", "BPM", "Key"],
  },
  {
    icon: "🎛",
    color: "var(--accent-purple)",
    title: "Referenz-Track",
    description:
      "Lade einen Referenz-Track hoch und die KI passt das Mastering an dessen Klangcharakter an: Loudness, Spektralbalance, Dynamik und Stereobreite werden automatisch gematched.",
    tags: ["AI Matching", "Reference", "Spectral"],
  },
  {
    icon: "🌊",
    color: "var(--accent-cyan)",
    title: "Spectrogram Waterfall",
    description:
      "Animierter Spectrogram-Wasserfall zeigt dir in Echtzeit, wie sich das Frequenzspektrum deiner Musik über die Zeit entwickelt — von Sub-Bass bis Air.",
    tags: ["Echtzeit", "Frequenz", "Zeit"],
  },
  {
    icon: "📄",
    color: "#f59e0b",
    title: "Mastering Report",
    description:
      "Detaillierter PDF-Report mit Pre/Post-Analyse-Vergleich, KI-Notizen, Loudness-Tabelle, Spektralbalance, Frequency Band Energy und allen verwendeten Mastering-Parametern.",
    tags: ["PDF", "Pre/Post", "Dokumentation"],
  },
  {
    icon: "⬇️",
    color: "var(--accent-purple)",
    title: "Alle Formate",
    description:
      "Download in WAV 32-bit Float, WAV 24-bit, WAV 16-bit (mit TPDF-Dither), FLAC 24-bit, MP3 320 kbps, MP3 128 kbps und AAC 256 kbps — alle Formate in einem Durchgang.",
    tags: ["WAV", "FLAC", "MP3", "AAC"],
  },
  {
    icon: "📱",
    color: "var(--accent-cyan)",
    title: "Mobile-first",
    description:
      "Vollständig responsive Oberfläche — funktioniert auf Desktop, Tablet und Smartphone. Lade von unterwegs hoch und lade den Master direkt runter.",
    tags: ["Responsive", "Mobile", "Tablet"],
  },
  {
    icon: "⌨️",
    color: "#f59e0b",
    title: "Keyboard Shortcuts",
    description:
      "Schneller arbeiten mit Keyboard-Shortcuts: M = Mastering starten, Leertaste = Play/Pause, A/B = zwischen Original und Master wechseln.",
    tags: ["M", "Space", "A/B"],
  },
];

export default function FeaturesPage() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Header />

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "7rem 2rem 3rem" }}>
        <div style={{
          display: "inline-block",
          background: "rgba(124,111,255,0.1)",
          border: "1px solid rgba(124,111,255,0.25)",
          borderRadius: "6px",
          padding: "0.25rem 0.75rem",
          fontSize: "0.75rem",
          color: "var(--accent-purple)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "1.5rem",
        }}>
          Features
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>
          Professionelles Mastering.{" "}
          <span style={{ color: "var(--accent-cyan)" }}>Vollautomatisch.</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto", lineHeight: 1.7 }}>
          UpMaDo kombiniert eine professionelle 12-stufige DSP-Pipeline mit KI-Parameterauswahl —
          für Ergebnisse auf Ozone/FabFilter-Niveau, in Sekunden.
        </p>
      </section>

      {/* Features Grid */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem 5rem" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.25rem",
        }}>
          {features.map((f) => (
            <div key={f.title} style={{
              background: "var(--bg-secondary)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "1.5rem",
              transition: "border-color 0.2s",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icon}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem", color: f.color }}>
                {f.title}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "1rem" }}>
                {f.description}
              </p>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {f.tags.map((tag) => (
                  <span key={tag} style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "4px",
                    padding: "0.15rem 0.5rem",
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        textAlign: "center",
        padding: "3rem 2rem 5rem",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "1rem" }}>
          Bereit für deinen ersten Master?
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          Einfach hochladen — in 30 Sekunden fertig.
        </p>
        <Link href="/" style={{
          background: "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))",
          color: "#fff",
          padding: "0.875rem 2.5rem",
          borderRadius: "10px",
          textDecoration: "none",
          fontSize: "1rem",
          fontWeight: 700,
          display: "inline-block",
        }}>
          Jetzt mastern →
        </Link>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
