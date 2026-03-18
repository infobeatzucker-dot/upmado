"use client";

import { useState } from "react";
import { PayPalSubscribeButton } from "./PayPalButton";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: string;
}

const PLAN_DETAILS: Record<string, { name: string; price: string; features: string[] }> = {
  basic_monthly: {
    name: "Basic Monthly",
    price: "€9.99/month",
    features: ["15 masters/month", "All formats", "Download history", "Re-download anytime"],
  },
  pro_monthly: {
    name: "Pro Monthly",
    price: "€24.99/month",
    features: ["Unlimited masters", "WAV 32-bit float", "Priority processing", "Stems mastering", "API access"],
  },
  basic_annual: {
    name: "Basic Annual",
    price: "€83.90/year",
    features: ["15 masters/month", "All formats", "2 months free vs monthly"],
  },
  pro_annual: {
    name: "Pro Annual",
    price: "€209.90/year",
    features: ["Unlimited masters", "All Pro features", "2 months free vs monthly"],
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
              Subscription active!
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              You now have full access to all {plan?.name} features.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: "var(--accent-cyan)",
                color: "#000",
              }}
            >
              Start mastering
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  {plan?.name || "Subscribe"}
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
                label={`Subscribe – ${plan?.price}`}
              />
            ) : (
              <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                Select a plan to continue
              </p>
            )}

            <p className="text-xs text-center mt-3" style={{ color: "var(--text-muted)" }}>
              Cancel anytime · Billed via PayPal · No hidden fees
            </p>
          </>
        )}
      </div>
    </div>
  );
}
