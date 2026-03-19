"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface AccountInfo {
  plan: string;
  mastersUsed: number;
  mastersLimit: number;
}

const PLAN_LABELS: Record<string, string> = {
  free:             "Free",
  ppu:              "Pay per Track",
  creator_monthly:  "Creator",
  creator_annual:   "Creator",
  pro_monthly:      "Pro",
  pro_annual:       "Pro",
  proplus_monthly:  "Pro+",
  proplus_annual:   "Pro+",
  studio_monthly:   "Studio",
  studio_annual:    "Studio",
};

export default function AccountDropdown() {
  const { data: session } = useSession();
  const [open, setOpen]   = useState(false);
  const [info, setInfo]   = useState<AccountInfo | null>(null);
  const ref               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) return;
    fetch("/api/account")
      .then(r => r.json())
      .then(d => setInfo({ plan: d.plan ?? "free", mastersUsed: d.mastersUsed ?? 0, mastersLimit: d.mastersLimit ?? 0 }))
      .catch(() => {});
  }, [session]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!session?.user) return null;

  const user      = session.user;
  const initial   = (user.name ?? user.email ?? "U")[0].toUpperCase();
  const planKey   = info?.plan ?? "free";
  const planLabel = PLAN_LABELS[planKey] ?? planKey;
  const isPro     = planKey.startsWith("proplus") || planKey.startsWith("studio");
  const hasLimit  = info && info.mastersLimit > 0;
  const pct       = hasLimit ? Math.min(100, Math.round((info!.mastersUsed / info!.mastersLimit) * 100)) : 0;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 34, height: 34,
          borderRadius: "50%",
          background: user.image
            ? "transparent"
            : "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))",
          border: "2px solid rgba(124,111,255,0.4)",
          cursor: "pointer",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.85rem",
          fontWeight: 700,
          color: "#fff",
          padding: 0,
        }}
        aria-label="Konto"
      >
        {user.image
          ? <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : initial}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          minWidth: 220,
          background: "var(--bg-elevated, #1a1a2e)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          overflow: "hidden",
          zIndex: 1000,
        }}>
          {/* User info */}
          <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name ?? user.email}
            </div>
            {user.name && (
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email}
              </div>
            )}
            {/* Plan badge */}
            <div style={{ marginTop: "0.4rem" }}>
              <span style={{
                fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em",
                padding: "0.2rem 0.5rem", borderRadius: "4px",
                background: isPro ? "rgba(245,200,66,0.15)" : "rgba(124,111,255,0.15)",
                color: isPro ? "#f5c842" : "var(--accent-purple)",
                border: `1px solid ${isPro ? "rgba(245,200,66,0.3)" : "rgba(124,111,255,0.3)"}`,
              }}>
                {isPro ? "⭐ " : "🤖 "}{planLabel}
              </span>
            </div>
          </div>

          {/* Masters counter */}
          {hasLimit && (
            <div style={{ padding: "0.65rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                            fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                <span>Masters diesen Monat</span>
                <span style={{ color: pct >= 90 ? "#f87171" : "#fff" }}>
                  {info!.mastersUsed} / {info!.mastersLimit}
                </span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                <div style={{
                  width: `${pct}%`, height: "100%", borderRadius: 2,
                  background: pct >= 90
                    ? "linear-gradient(90deg, #f87171, #ef4444)"
                    : "linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))",
                  transition: "width 0.3s ease",
                }}/>
              </div>
            </div>
          )}

          {/* Menu items */}
          <div style={{ padding: "0.4rem 0" }}>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              style={{
                display: "block", padding: "0.55rem 1rem",
                fontSize: "0.85rem", color: "var(--text-secondary)",
                textDecoration: "none",
              }}
            >
              👤 Mein Konto
            </Link>
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              style={{
                display: "block", padding: "0.55rem 1rem",
                fontSize: "0.85rem", color: "var(--text-secondary)",
                textDecoration: "none",
              }}
            >
              ⬆️ Upgrade
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "0.55rem 1rem", background: "none", border: "none",
                fontSize: "0.85rem", color: "var(--text-muted)", cursor: "pointer",
              }}
            >
              🚪 Abmelden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
