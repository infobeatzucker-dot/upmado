"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const PricingModal = dynamic(() => import("./PricingModal"), { ssr: false });

const PLANS = [
  {
    id: "free",
    name: "Free",
    priceMonthly: "€0",
    priceAnnual:  "€0",
    period: "",
    descMonthly: "Try it out",
    descAnnual:  "Try it out",
    color: "var(--text-muted)",
    borderColor: "var(--border-subtle)",
    features: [
      "3 masters per day",
      "MP3 128kbps only",
      "AI mastering chain",
      "Basic visualizers",
    ],
    missing: ["WAV / FLAC downloads", "High-quality MP3 320", "Priority processing"],
    cta: "Start free",
    ctaStyle: "secondary",
  },
  {
    id: "ppu",
    name: "Pay per Download",
    priceMonthly: "€2.99",
    priceAnnual:  "€2.99",
    period: "/ track",
    descMonthly: "One-time purchase",
    descAnnual:  "One-time purchase",
    color: "var(--accent-cyan)",
    borderColor: "rgba(0,229,196,0.3)",
    features: [
      "All formats: WAV 24/16, FLAC, MP3 320, AAC",
      "7-day download link",
      "No subscription needed",
      "Full mastering chain",
    ],
    missing: [],
    cta: "Buy this track",
    ctaStyle: "cyan",
    highlight: false,
  },
  {
    id: "basic",
    name: "Basic",
    priceMonthly: "€9.99",
    priceAnnual:  "€6.99",
    period: "/ month",
    descMonthly: "15 masters included",
    descAnnual:  "€83.90 / year · save 2 months",
    color: "var(--accent-purple)",
    borderColor: "rgba(124,111,255,0.3)",
    features: [
      "15 masters / month",
      "All formats",
      "Download history",
      "Re-download anytime",
    ],
    missing: ["WAV 32-bit float", "Unlimited masters"],
    cta: "Subscribe",
    ctaStyle: "purple",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: "€24.99",
    priceAnnual:  "€17.49",
    period: "/ month",
    descMonthly: "For professionals",
    descAnnual:  "€209.90 / year · save 2 months",
    color: "var(--accent-gold)",
    borderColor: "rgba(245,200,66,0.4)",
    features: [
      "Unlimited masters",
      "All formats incl. WAV 32-bit float",
      "Priority processing",
      "Stems mastering",
      "API access",
      "Download history",
    ],
    missing: [],
    cta: "Go Pro",
    ctaStyle: "gold",
    highlight: true,
  },
];

function CtaButton({ style, label, onClick }: { style: string; label: string; onClick?: () => void }) {
  const base = "w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90";

  if (style === "gold") {
    return (
      <button onClick={onClick} className={base} style={{ background: "linear-gradient(135deg, var(--accent-gold), #e8a000)", color: "#000", boxShadow: "0 0 16px rgba(245,200,66,0.3)" }}>
        {label}
      </button>
    );
  }
  if (style === "cyan") {
    return (
      <button onClick={onClick} className={base} style={{ background: "linear-gradient(135deg, var(--accent-cyan), #00b8a0)", color: "#000" }}>
        {label}
      </button>
    );
  }
  if (style === "purple") {
    return (
      <button onClick={onClick} className={base} style={{ background: "linear-gradient(135deg, var(--accent-purple), #5a4fd0)", color: "#fff" }}>
        {label}
      </button>
    );
  }
  return (
    <button onClick={onClick} className={base} style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
      {label}
    </button>
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
    const planType = planId + suffix;
    setSelectedPlan(planType);
    setModalOpen(true);
  };

  return (
    <>
    <PricingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} selectedPlan={selectedPlan} />
    <section id="pricing" className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="label mb-3">Pricing</div>
        <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Simple, transparent pricing
        </h2>
        <p className="text-base mb-6" style={{ color: "var(--text-secondary)" }}>
          Start free, pay only for what you need.
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
            } : {
              color: "var(--text-muted)",
              border: "1px solid transparent",
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            style={billing === "annual" ? {
              background: "rgba(245,200,66,0.12)",
              color: "var(--accent-gold)",
              border: "1px solid rgba(245,200,66,0.35)",
            } : {
              color: "var(--text-muted)",
              border: "1px solid transparent",
            }}
          >
            Annual
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
              style={{
                background: billing === "annual" ? "rgba(245,200,66,0.2)" : "rgba(245,200,66,0.1)",
                color: "var(--accent-gold)",
                border: "1px solid rgba(245,200,66,0.25)",
              }}
            >
              −2 mo
            </span>
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  ? `0 0 30px rgba(245,200,66,0.1), 0 4px 20px rgba(0,0,0,0.3)`
                  : "0 4px 20px rgba(0,0,0,0.2)",
                position: "relative",
              }}
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-gold), #e8a000)",
                    color: "#000",
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              <div className="mb-4">
                <div className="label mb-1" style={{ color: plan.color }}>{plan.name}</div>
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
                  <li key={f} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>✗</span>
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
        All prices incl. VAT · Cancel anytime · Secure payment via PayPal
      </div>
    </section>
    </>
  );
}
