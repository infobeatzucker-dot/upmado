"use client";

import { useState, type CSSProperties } from "react";

type Lang = "de" | "en";

const BARS = Array.from({ length: 72 }, (_, index) => {
  const envelope = Math.sin((index / 71) * Math.PI);
  const detail = 0.46 + Math.abs(Math.sin(index * 1.41)) * 0.38 + Math.abs(Math.cos(index * 0.51)) * 0.16;
  return Math.max(7, Math.round(envelope * detail * 94));
});

const COPY = {
  badge: { de: "Präziser A/B-Vergleich", en: "Precision A/B comparison" },
  title: { de: "Höre und sieh den Unterschied.", en: "Hear and see the difference." },
  text: {
    de: "Vergleiche Original und Master. Lautheit, Dynamik und Frequenzbalance reagieren direkt auf deine Auswahl.",
    en: "Compare the original and master. Loudness, dynamics and frequency balance respond directly to your selection.",
  },
  before: { de: "Original", en: "Original" },
  after: { de: "Master", en: "Master" },
};

export default function BeforeAfterConsole({ lang = "de" }: { lang?: Lang }) {
  const [mastered, setMastered] = useState(true);
  const decimal = (value: string) => lang === "de" ? value.replace(".", ",") : value;

  return (
    <section className="precision-compare-section" id="vorher-nachher">
      <div className="precision-compare-heading">
        <span>{COPY.badge[lang]}</span>
        <h2>{COPY.title[lang]}</h2>
        <p>{COPY.text[lang]}</p>
      </div>

      <div className={`precision-compare-console ${mastered ? "is-mastered" : "is-original"}`}>
        <div className="precision-compare-top">
          <div><small>UPMADO SIGNAL LAB</small><strong>{mastered ? COPY.after[lang] : COPY.before[lang]}</strong></div>
          <div className="precision-ab-switch" role="group" aria-label="A/B comparison">
            <button type="button" aria-pressed={!mastered} className={!mastered ? "active" : ""} onClick={() => setMastered(false)}>A · {COPY.before[lang]}</button>
            <button type="button" aria-pressed={mastered} className={mastered ? "active" : ""} onClick={() => setMastered(true)}>B · {COPY.after[lang]}</button>
          </div>
        </div>

        <div className="precision-wave-stage" aria-hidden="true">
          <div className="precision-wave-grid" />
          <div className="precision-wave-bars">
            {BARS.map((height, index) => (
              <i key={index} style={{
                "--bar-height": `${mastered ? Math.min(100, height * 1.15) : height * 0.72}%`,
                "--bar-delay": `${index * -22}ms`,
              } as CSSProperties} />
            ))}
          </div>
          <div className="precision-playhead" />
          <div className="precision-time-axis"><span>0:00</span><span>0:45</span><span>1:30</span><span>2:15</span><span>3:00</span></div>
        </div>

        <div className="precision-metric-grid">
          {[
            [lang === "de" ? "Lautheit" : "Loudness", "−14.2", "−9.0", "LUFS"],
            [lang === "de" ? "Dynamik" : "Dynamics", "8.1", "10.8", "DR"],
            [lang === "de" ? "True Peak" : "True peak", "−2.4", "−1.0", "dBTP"],
          ].map(([label, before, after, unit]) => (
            <div className="precision-metric-card" key={label}>
              <span>{label}</span>
              <div><small>{decimal(before)}</small><b>→</b><strong>{decimal(after)}</strong><em>{unit}</em></div>
            </div>
          ))}
          <div className="precision-dynamics-card" aria-hidden="true">
            <span>{lang === "de" ? "Transienten" : "Transients"}</span>
            <div>{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ height: `${22 + Math.abs(Math.sin(i * .82)) * (mastered ? 67 : 45)}%` }} />)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
