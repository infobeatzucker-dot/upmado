"use client";

import { useState } from "react";
import { PayPalSubscribeButton } from "./PayPalButton";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: string;
}

const PLAN_DETAILS: Record<string, { name: string; price: string; features: string[] }> = {
  creator_monthly: {
    name: "Creator Monatlich",
    price: "€7.99/Monat",
    features: ["25 Master/Monat", "KI-Parameterauswahl", "Alle Formate", "Download-Verlauf"],
  },
  creator_annual: {
    name: "Creator Jährlich",
    price: "€67.10/Jahr",
    features: ["25 Master/Monat", "KI-Parameterauswahl", "Alle Formate", "3 Monate gratis vs. monatlich"],
  },
  pro_monthly: {
    name: "Pro Monatlich",
    price: "€14.99/Monat",
    features: ["100 Master/Monat", "KI-Parameterauswahl", "Alle Formate", "Referenz-Track Mastering"],
  },
  pro_annual: {
    name: "Pro Jährlich",
    price: "€125.90/Jahr",
    features: ["100 Master/Monat", "KI-Parameterauswahl", "Alle Pro-Features", "3 Monate gratis"],
  },
  proplus_monthly: {
    name: "Pro+ Monatlich",
    price: "€24.99/Monat",
    features: ["250 Master/Monat", "KI-Parameterauswahl", "WAV 32-bit Float", "Prioritäts-Processing"],
  },
  proplus_annual: {
    name: "Pro+ Jährlich",
    price: "€209.90/Jahr",
    features: ["250 Master/Monat", "Alle Pro+-Features", "WAV 32-bit Float", "3 Monate gratis"],
  },
  studio_monthly: {
    name: "Studio Monatlich",
    price: "€49.99/Monat",
    features: ["Unbegrenzte Master", "API-Zugang", "Stems Mastering", "White-Label Report", "Team-Seats (3)"],
  },
  studio_annual: {
    name: "Studio Jährlich",
    price: "€419.90/Jahr",
    features: ["Unbegrenzte Master", "API-Zugang", "Alle Studio-Features", "3 Monate gratis"],
  },
};

export default function PricingModal({ isOpen, onClose, selectedPlan }: Props) {
  const [subscribed, setSubscribed] = useState(false);

  if (!isOpen) return null;

  const plan = selectedPlan ? PLAN_DETAILS[selectedPlan] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="glass-panel-elevated p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {subscribed ? (
          <div className="text-center py-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                background: "rgba(0,229,196,0.15)",
                border: "2px solid rgba(0,229,196,0.4)",
              }}
            >
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--accent-cyan)" }}>
              Abo aktiv!
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Du hast jetzt vollen Zugang zu allen {plan?.name}-Features.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "var(--accent-cyan)", color: "#000" }}
            >
              Mastering starten
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  {plan?.name || "Abo wählen"}
                </h3>
                <div className="mono text-lg font-bold mt-0.5" style={{ color: "var(--accent-gold)" }}>
                  {plan?.price}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-lg leading-none"
                style={{ color: "var(--text-muted)" }}
              >
                ×
              </button>
            </div>

            {plan && (
              <ul className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--accent-cyan)" }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            )}

            {selectedPlan ? (
              <PayPalSubscribeButton
                planType={selectedPlan}
                label={`Abonnieren – ${plan?.price}`}
              />
            ) : (
              <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                Plan auswählen um fortzufahren
              </p>
            )}

            <p className="text-xs text-center mt-3" style={{ color: "var(--text-muted)" }}>
              Jederzeit kündbar · Zahlung via PayPal · Keine versteckten Kosten
            </p>
          </>
        )}
      </div>
    </div>
  );
}
