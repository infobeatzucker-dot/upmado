import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Hilfe – UpMaDo",
  description: "Häufige Fragen und Hilfe zu UpMaDo – KI-gestütztes Online-Mastering.",
};

const faqs = [
  {
    category: "Erste Schritte",
    color: "var(--accent-purple)",
    items: [
      {
        q: "Wie funktioniert UpMaDo?",
        a: "Lade eine WAV- oder MP3-Datei hoch, wähle deine Zielplattform und Genre-Preset, stelle die Mastering-Intensität ein und klicke auf \"Mastern\" (oder drücke M). Die KI analysiert dein Audio, wählt automatisch die optimalen Parameter und die 12-stufige DSP-Pipeline verarbeitet deinen Track professionell.",
      },
      {
        q: "Welche Dateiformate werden unterstützt?",
        a: "Upload: WAV (alle Bit-Tiefen), MP3, FLAC, AIFF. Download: WAV 32-bit Float, WAV 24-bit, WAV 16-bit (mit Dither), FLAC 24-bit, MP3 320 kbps, MP3 128 kbps, AAC 256 kbps.",
      },
      {
        q: "Wie lange dauert das Mastering?",
        a: "Die Analyse dauert ca. 5–10 Sekunden. Das vollständige Mastering (DSP-Pipeline + alle Exportformate) dauert je nach Tracklänge 30 Sekunden bis 3 Minuten. Der Fortschritt wird in Echtzeit angezeigt.",
      },
    ],
  },
  {
    category: "Mastering",
    color: "var(--accent-cyan)",
    items: [
      {
        q: "Was ist der Mastering Intensity Slider?",
        a: "Der Intensity-Slider (0–100%) steuert, wie stark die Bearbeitung ist. Bei 0% ist das Mastering transparent — kaum Eingriffe, alles klingt fast wie das Original. Bei 100% wird maximales Processing angewendet: volle Kompression, starke EQ-Korrekturen, volle Sättigung. 65% ist der empfohlene Ausgangswert für die meisten Tracks.",
      },
      {
        q: "Was bedeuten die Plattform-Presets?",
        a: "Spotify: –14 LUFS (Standard-Streaming), Apple Music: –16 LUFS (etwas leiser), YouTube: –14 LUFS, Club/DJ: –9 LUFS (sehr laut für Clubsound), Custom: selbst einstellbar. Der True Peak Ceiling liegt immer bei –1 dBTP.",
      },
      {
        q: "Was ist der Referenz-Track?",
        a: "Lade einen professionellen Track hoch, den du als Klang-Referenz nutzen möchtest. Die KI analysiert dessen Spektralbalance, Loudness, Dynamik und Stereobreite und passt dein Mastering entsprechend an — ähnlich wie in professionellen Studios.",
      },
      {
        q: "Was ist M/S Processing?",
        a: "Mid/Side-Processing trennt das Stereo-Signal in Mitte (Mid = L+R) und Seite (Side = L–R). Dies ermöglicht unabhängige Bearbeitung von Breite und Tiefe. UpMaDo entfernt außerdem automatisch tiefe Frequenzen unter 120 Hz aus dem Seitenkanal (Mono-Bass) für bessere Club-Kompatibilität.",
      },
    ],
  },
  {
    category: "A/B-Vergleich & Visualizer",
    color: "#f59e0b",
    items: [
      {
        q: "Was zeigt der A/B-Player?",
        a: "A = dein Original-Upload, B = der fertige Master. Wechsle jederzeit zwischen den beiden — der Player pausiert nicht. Alle Visualisierungen (Spektrum, Wellenform, Stereofeld, LUFS, Spectrogram) reagieren in Echtzeit auf die aktuelle Wiedergabe.",
      },
      {
        q: "Was sind die roten Marker in der Wellenform?",
        a: "Rote Balken zeigen Stellen im Audio, wo der Peak-Pegel über 0.98 (–0.17 dBFS) liegt — mögliche Clipping-Zonen im Original. Im gemasterten Audio sollten diese durch den True Peak Limiter verschwunden sein.",
      },
      {
        q: "Was ist der Spectrogram Waterfall?",
        a: "Der Spectrogram Waterfall zeigt das Frequenzspektrum über die Zeit: X-Achse = Frequenz (20 Hz – 20 kHz), Y-Achse = Zeit, Farbe = Lautstärke (schwarz = leise, weiß = laut). So erkennst du, wann welche Frequenzen aktiv sind.",
      },
      {
        q: "Was ist das Stereofeld (Vektorscop)?",
        a: "Das Lissajous-Vektorscop zeigt die Stereobreite deines Signals. Ein perfekt senkrechter Strich = komplett mono, eine Ellipse = stereo, ein weiter Kreis = sehr breites Stereo. Die Korrelationsanzeige unten zeigt, ob das Signal mono-kompatibel ist (positiver Wert = gut).",
      },
    ],
  },
  {
    category: "Analyse & Report",
    color: "var(--accent-purple)",
    items: [
      {
        q: "Was bedeutet \"Frequency Band Energy\"?",
        a: "Frequency Band Energy zeigt die RMS-Energie in 5 Frequenzbändern: Sub (20–80 Hz), Low (80–300 Hz), Mid (300–3k Hz), High (3k–10k Hz), Air (10k–20k Hz). Diese Werte in dB zeigen, wie laut und energiereich jeder Bereich ist — hilfreich für die Klangbalance-Beurteilung.",
      },
      {
        q: "Was ist der Mastering Report?",
        a: "Der PDF-Report enthält: KI-Notizen zur Mastering-Entscheidung, Pre/Post-Loudness-Vergleich (LUFS, True Peak, DR), Frequency Band Energy vorher/nachher, Spectral- und Stereo-Analyse sowie alle technischen Parameter. Ideal für Dokumentation oder Kunden.",
      },
      {
        q: "Was ist LUFS?",
        a: "LUFS (Loudness Units Full Scale) ist der Standard zur Lautstärkemessung für Streaming-Plattformen. Spotify normalisiert auf –14 LUFS, was bedeutet: lautere Tracks werden automatisch leiser gedreht. Mit UpMaDo wird dein Track exakt auf den richtigen LUFS-Wert normalisiert.",
      },
    ],
  },
  {
    category: "Technisches",
    color: "var(--accent-cyan)",
    items: [
      {
        q: "Werden meine Audiodateien gespeichert?",
        a: "Nein. Hochgeladene Audiodateien werden ausschließlich im Arbeitsspeicher verarbeitet und nach Abschluss sofort gelöscht (max. 10 Minuten). Keine dauerhafte Speicherung, keine Weitergabe.",
      },
      {
        q: "Welche Browser werden unterstützt?",
        a: "Alle modernen Browser: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Für die Audio-Visualisierungen wird die Web Audio API benötigt — diese ist in allen genannten Browsern verfügbar.",
      },
      {
        q: "Was ist der Keyboard Shortcut M?",
        a: "Drücke M auf der Tastatur, um das Mastering zu starten — genauso wie der Mastern-Button. Praktisch wenn du mehrere Tracks nacheinander masterst. Die Leertaste startet/stoppt die Wiedergabe.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Header />

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "7rem 2rem 2rem" }}>
        <div style={{
          display: "inline-block",
          background: "rgba(0,229,196,0.1)",
          border: "1px solid rgba(0,229,196,0.25)",
          borderRadius: "6px",
          padding: "0.25rem 0.75rem",
          fontSize: "0.75rem",
          color: "var(--accent-cyan)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "1.5rem",
        }}>
          Hilfe & FAQ
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>
          Wie kann ich dir helfen?
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "550px", margin: "0 auto" }}>
          Antworten auf die häufigsten Fragen zu UpMaDo.
          Nicht gefunden? Schreib uns:{" "}
          <a href="mailto:info@re-beatz.com" style={{ color: "var(--accent-cyan)" }}>
            info@re-beatz.com
          </a>
        </p>
      </section>

      {/* FAQ */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 2rem 5rem" }}>
        {faqs.map((section) => (
          <div key={section.category} style={{ marginBottom: "3rem" }}>
            {/* Section header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}>
              <div style={{
                width: "3px",
                height: "1.25rem",
                background: section.color,
                borderRadius: "2px",
              }} />
              <h2 style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: section.color,
                margin: 0,
              }}>
                {section.category}
              </h2>
            </div>

            {/* Questions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {section.items.map((item) => (
                <details key={item.q} style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}>
                  <summary style={{
                    padding: "1.1rem 1.5rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.925rem",
                    color: "var(--text-primary)",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    userSelect: "none",
                  }}>
                    {item.q}
                    <span style={{ color: section.color, fontSize: "1.1rem", flexShrink: 0, marginLeft: "1rem" }}>+</span>
                  </summary>
                  <div style={{
                    padding: "0 1.5rem 1.25rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                    lineHeight: 1.75,
                  }}>
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div style={{
          background: "var(--bg-elevated)",
          border: "1px solid rgba(124,111,255,0.2)",
          borderRadius: "12px",
          padding: "2rem",
          textAlign: "center",
          marginTop: "2rem",
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Noch Fragen?
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
            Schreib uns eine E-Mail — wir antworten innerhalb von 24 Stunden.
          </p>
          <a href="mailto:info@re-beatz.com" style={{
            background: "var(--accent-purple)",
            color: "#fff",
            padding: "0.625rem 1.5rem",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            display: "inline-block",
          }}>
            info@re-beatz.com
          </a>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
