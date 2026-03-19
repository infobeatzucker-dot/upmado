"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const PricingModal = dynamic(() => import("./PricingModal"), { ssr: false });

const PLANS = [
  {
    id: "free",
    name: "Free",
    badge: null,
    priceMonthly: "€0",
    priceAnnual:  "€0",
    period: "",
    descMonthly: "Einfach ausprobieren",
    descAnnual:  "Einfach ausprobieren",
    color: "var(--text-muted)",
    borderColor: "var(--border-subtle)",
    ai: false,
    features: [
      "3 Master / Tag",
      "DSP-Mastering-Chain",
      "MP3 128 kbps",
      "Live-Visualizer",
    ],
    missing: ["KI-Parameterauswahl", "WAV / FLAC", "MP3 320 kbps"],
    cta: "Kostenlos starten",
    ctaStyle: "secondary",
  },
  {
    id: "ppu",
    name: "Pay per Track",
    badge: null,
    priceMonthly: "€1.99",
    priceAnnual:  "€1.99",
    period: "/ Track",
    descMonthly: "Einmalige Zahlung, kein Abo",
    descAnnual:  "Einmalige Zahlung, kein Abo",
    color: "var(--accent-cyan)",
    borderColor: "rgba(0,229,196,0.3)",
    ai: false,
    features: [
      "Alle Formate: WAV 24/16, FLAC, MP3 320, AAC",
      "2h Download-Link",
      "Kein Abo nötig",
      "Volle DSP-Pipeline",
    ],
    missing: ["KI-Parameterauswahl"],
    cta: "Track kaufen",
    ctaStyle: "cyan",
  },
  {
    id: "creator",
    name: "Creator",
    badge: null,
    priceMonthly: "€7.99",
    priceAnnual:  "€5.59",
    period: "/ Monat",
    descMonthly: "25 Master inklusive",
    descAnnual:  "€67.10 / Jahr · 3 Monate gratis",
    color: "var(--accent-purple)",
    borderColor: "rgba(124,111,255,0.3)",
    ai: true,
    features: [
      "25 Master / Monat",
      "KI-Parameterauswahl",
      "Alle Formate",
      "Mastering-Verlauf (Metadaten)",
    ],
    missing: ["WAV 32-bit Float", "Mehr als 25 Master"],
    cta: "Creator werden",
    ctaStyle: "purple",
  },
  {
    id: "pro",
    name: "Pro",
    badge: null,
    priceMonthly: "€14.99",
    priceAnnual:  "€10.49",
    period: "/ Monat",
    descMonthly: "100 Master inklusive",
    descAnnual:  "€125.90 / Jahr · 3 Monate gratis",
    color: "#06b6d4",
    borderColor: "rgba(6,182,212,0.3)",
    ai: true,
    features: [
      "100 Master / Monat",
      "KI-Parameterauswahl",
      "Alle Formate",
      "Referenz-Track Mastering",
      "Mastering-Verlauf (Metadaten)",
    ],
    missing: ["WAV 32-bit Float", "Mehr als 100 Master"],
    cta: "Pro starten",
    ctaStyle: "teal",
  },
  {
    id: "proplus",
    name: "Pro+",
    badge: "BELIEBT",
    priceMonthly: "€24.99",
    priceAnnual:  "€17.49",
    period: "/ Monat",
    descMonthly: "250 Master inklusive",
    descAnnual:  "€209.90 / Jahr · 3 Monate gratis",
    color: "var(--accent-gold)",
    borderColor: "rgba(245,200,66,0.4)",
    ai: true,
    features: [
      "250 Master / Monat",
      "KI-Parameterauswahl",
      "Alle Formate inkl. WAV 32-bit Float",
      "Referenz-Track Mastering",
      "Prioritäts-Processing",
      "Mastering-Verlauf (Metadaten)",
    ],
    missing: [],
    cta: "Pro+ holen",
    ctaStyle: "gold",
    highlight: true,
  },
  {
    id: "studio",
    name: "Studio",
    badge: null,
    priceMonthly: "€49.99",
    priceAnnual:  "€34.99",
    period: "/ Monat",
    descMonthly: "Unbegrenzt · für Profis",
    descAnnual:  "€419.90 / Jahr · 3 Monate gratis",
    color: "#a855f7",
    borderColor: "rgba(168,85,247,0.35)",
    ai: true,
    features: [
      "Unbegrenzte Master",
      "KI-Parameterauswahl",
      "Alle Formate inkl. WAV 32-bit Float",
      "API-Zugang",
      "Stems Mastering",
      "White-Label Mastering Report",
      "Prioritäts-Processing",
      "Team-Seats (bis 3)",
    ],
    missing: [],
    cta: "Studio buchen",
    ctaStyle: "violet",
  },
];

function CtaButton({ style, label, onClick }: { style: string; label: string; onClick?: () => void }) {
  const base = "w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 cursor-pointer";

  const styles: Record<string, React.CSSProperties> = {
    gold:      { background: "linear-gradient(135deg, var(--accent-gold), #e8a000)", color: "#000", boxShadow: "0 0 16px rgba(245,200,66,0.3)" },
    cyan:      { background: "linear-gradient(135deg, var(--accent-cyan), #00b8a0)", color: "#000" },
    purple:    { background: "linear-gradient(135deg, var(--accent-purple), #5a4fd0)", color: "#fff" },
    teal:      { background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "#fff" },
    violet:    { background: "linear-gradient(135deg, #a855f7, #7c3aed)", color: "#fff" },
    secondary: { background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" },
  };

  return (
    <button onClick={onClick} className={base} style={styles[style] || styles.secondary}>
      {label}
    </button>
  );
}

function AiBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
      style={{
        background: "rgba(124,111,255,0.15)",
        border: "1px solid rgba(124,111,255,0.35)",
        color: "var(--accent-purple)",
        letterSpacing: "0.05em",
      }}
    >
      🤖 KI
    </span>
  );
}

export default function PricingSection() {
  const [modalOpen,    setModalOpen]    = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [billing,      setBilling]      = useState<"monthly" | "annual">("monthly");

  const handleCta = (planId: string) => {
    if (planId === "free") return;
    if (planId === "ppu") {
      document.getElementById("mastering-interface")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const suffix = billing === "annual" ? "_annual" : "_monthly";
    setSelectedPlan(planId + suffix);
    setModalOpen(true);
  };

  return (
    <>
      <PricingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} selectedPlan={selectedPlan} />

      <section id="pricing" className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="label mb-3">Pricing</div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Einfache, transparente Preise
          </h2>
          <p className="text-base mb-2" style={{ color: "var(--text-secondary)" }}>
            Starte kostenlos — zahle nur für das, was du brauchst.
          </p>
          <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
            🤖 KI-Parameterauswahl ab Creator-Plan · DSP-Mastering immer inklusive
          </p>

          {/* Monthly / Annual toggle */}
          <div className="inline-flex items-center rounded-xl p-1 gap-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)" }}>
            <button
              onClick={() => setBilling("monthly")}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={billing === "monthly" ? {
                background: "rgba(124,111,255,0.18)",
                color: "var(--accent-purple)",
                border: "1px solid rgba(124,111,255,0.35)",
              } : { color: "var(--text-muted)", border: "1px solid transparent" }}
            >
              Monatlich
            </button>
            <button
              onClick={() => setBilling("annual")}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={billing === "annual" ? {
                background: "rgba(245,200,66,0.12)",
                color: "var(--accent-gold)",
                border: "1px solid rgba(245,200,66,0.35)",
              } : { color: "var(--text-muted)", border: "1px solid transparent" }}
            >
              Jährlich
              <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{
                  background: billing === "annual" ? "rgba(245,200,66,0.2)" : "rgba(245,200,66,0.1)",
                  color: "var(--accent-gold)",
                  border: "1px solid rgba(245,200,66,0.25)",
                }}>
                −3 Mo
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const price = billing === "annual" ? plan.priceAnnual : plan.priceMonthly;
            const desc  = billing === "annual" ? plan.descAnnual  : plan.descMonthly;

            return (
              <div
                key={plan.id}
                className="glass-panel p-5 flex flex-col transition-all"
                style={{
                  border: `1px solid ${plan.borderColor}`,
                  boxShadow: plan.highlight
                    ? `0 0 30px rgba(245,200,66,0.12), 0 4px 20px rgba(0,0,0,0.3)`
                    : "0 4px 20px rgba(0,0,0,0.2)",
                  position: "relative",
                }}
              >
                {plan.badge && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                    style={{
                      background: "linear-gradient(135deg, var(--accent-gold), #e8a000)",
                      color: "#000",
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="label" style={{ color: plan.color }}>{plan.name}</span>
                    {plan.ai && <AiBadge />}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold mono" style={{ color: "var(--text-primary)" }}>
                      {price}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {plan.period}
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {desc}
                  </div>
                </div>

                <ul className="space-y-2 flex-1 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <span style={{ color: plan.color, flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-muted)", opacity: 0.5 }}>
                      <span style={{ flexShrink: 0 }}>✗</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <CtaButton style={plan.ctaStyle} label={plan.cta} onClick={() => handleCta(plan.id)} />
              </div>
            );
          })}
        </div>

        <div className="text-center mt-6 text-xs" style={{ color: "var(--text-muted)" }}>
          Alle Preise inkl. MwSt. · Jederzeit kündbar · Sichere Zahlung via PayPal
        </div>
      </section>
    </>
  );
}
