"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface AccountData {
  user: { id: string; email: string; name: string | null; image: string | null; hasPassword: boolean; createdAt: string };
  plan: string;
  tier: string;
  mastersUsed: number;
  mastersLimit: number;
  validUntil: string | null;
  subStatus: string | null;
  masters: Array<{
    id: string; originalName: string; platform: string; preset: string;
    status: string; lufsIn: number | null; lufsOut: number | null; createdAt: string;
  }>;
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free", ppu: "Pay per Track",
  creator_monthly: "Creator (monatlich)", creator_annual: "Creator (jährlich)",
  pro_monthly: "Pro (monatlich)",         pro_annual: "Pro (jährlich)",
  proplus_monthly: "Pro+ (monatlich)",    proplus_annual: "Pro+ (jährlich)",
  studio_monthly: "Studio (monatlich)",   studio_annual: "Studio (jährlich)",
};

function fmt(lufs: number | null) {
  if (lufs == null) return "—";
  return `${lufs.toFixed(1)} LUFS`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData]           = useState<AccountData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [subscribedToast, setSubscribedToast] = useState(false);

  // Show success toast if redirected from PayPal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("subscribed") === "1") {
      setSubscribedToast(true);
      // Clean up URL
      window.history.replaceState({}, "", "/account");
      setTimeout(() => setSubscribedToast(false), 6000);
    }
  }, []);

  // Name edit
  const [editName, setEditName]   = useState("");
  const [nameMsg, setNameMsg]     = useState("");

  // Password change
  const [curPw, setCurPw]         = useState("");
  const [newPw, setNewPw]         = useState("");
  const [newPw2, setNewPw2]       = useState("");
  const [pwMsg, setPwMsg]         = useState("");

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/account")
      .then(r => r.json())
      .then(d => { setData(d); setEditName(d.user.name ?? ""); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status]);

  async function saveName(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    setNameMsg(res.ok ? "✓ Name gespeichert" : "Fehler beim Speichern");
    setTimeout(() => setNameMsg(""), 3000);
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    if (newPw !== newPw2) { setPwMsg("Passwörter stimmen nicht überein."); return; }
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
    });
    const d = await res.json();
    setPwMsg(res.ok ? "✓ Passwort geändert" : (d.error ?? "Fehler"));
    if (res.ok) { setCurPw(""); setNewPw(""); setNewPw2(""); }
    setTimeout(() => setPwMsg(""), 4000);
  }

  async function deleteAccount() {
    const res = await fetch("/api/account", { method: "DELETE" });
    if (res.ok) await signOut({ callbackUrl: "/" });
  }

  if (status === "loading" || loading) {
    return (
      <div style={{ background: "var(--bg-primary)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Lädt…</div>
      </div>
    );
  }

  if (!data) return null;

  const pct = data.mastersLimit > 0 ? Math.min(100, Math.round(data.mastersUsed / data.mastersLimit * 100)) : 0;
  const isPro = data.plan.startsWith("proplus") || data.plan.startsWith("studio");

  const section = (title: string, children: React.ReactNode) => (
    <section style={{
      background: "var(--bg-elevated, #1a1a2e)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "12px",
      padding: "1.5rem",
      marginBottom: "1.5rem",
    }}>
      <h2 style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                   color: "var(--accent-purple)", marginBottom: "1.25rem" }}>{title}</h2>
      {children}
    </section>
  );

  const inputSty: React.CSSProperties = {
    width: "100%", padding: "0.55rem 0.8rem",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "7px", color: "var(--text-primary, #fff)", fontSize: "0.88rem",
    outline: "none", boxSizing: "border-box",
  };

  const msgStyle = (msg: string): React.CSSProperties => ({
    fontSize: "0.8rem", marginTop: "0.4rem",
    color: msg.startsWith("✓") ? "#6ee7b7" : "#fca5a5",
  });

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <Header />

      {/* Subscription success toast */}
      {subscribedToast && (
        <div style={{
          position: "fixed", top: "4.5rem", left: "50%", transform: "translateX(-50%)",
          zIndex: 100, background: "rgba(0,229,196,0.15)",
          border: "1px solid rgba(0,229,196,0.4)", borderRadius: "12px",
          padding: "0.75rem 1.5rem", backdropFilter: "blur(12px)",
          color: "var(--accent-cyan)", fontWeight: 600, fontSize: "0.9rem",
          boxShadow: "0 4px 24px rgba(0,229,196,0.2)",
        }}>
          ✓ Abo erfolgreich aktiviert! Dein Plan wird gleich aktualisiert.
        </div>
      )}

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "6rem 1.5rem 4rem" }}>

        {/* Hero */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{
            display: "inline-block", background: "rgba(124,111,255,0.1)",
            border: "1px solid rgba(124,111,255,0.25)", borderRadius: "6px",
            padding: "0.25rem 0.75rem", fontSize: "0.72rem", color: "var(--accent-purple)",
            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem",
          }}>Konto</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", margin: 0 }}>
            Mein Konto
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            {data.user.email}
          </p>
        </div>

        {/* ── Abo-Status ─────────────────────────────────── */}
        {section("Abo-Status", (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
              <div>
                <span style={{
                  fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em",
                  padding: "0.25rem 0.6rem", borderRadius: "5px",
                  background: isPro ? "rgba(245,200,66,0.15)" : "rgba(124,111,255,0.15)",
                  color: isPro ? "#f5c842" : "var(--accent-purple)",
                  border: `1px solid ${isPro ? "rgba(245,200,66,0.3)" : "rgba(124,111,255,0.3)"}`,
                }}>
                  {PLAN_LABELS[data.plan] ?? data.plan}
                </span>
                {data.validUntil && (
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginLeft: "0.75rem" }}>
                    gültig bis {fmtDate(data.validUntil)}
                  </span>
                )}
              </div>
              {data.plan === "free" && (
                <a href="/pricing" style={{
                  fontSize: "0.82rem", fontWeight: 600, color: "var(--accent-cyan)", textDecoration: "none",
                }}>Upgraden →</a>
              )}
            </div>

            {data.mastersLimit > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem",
                              color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                  <span>Masters diesen Monat</span>
                  <span style={{ color: pct >= 90 ? "#f87171" : "var(--text-primary)" }}>
                    {data.mastersUsed} / {data.mastersLimit}
                  </span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3 }}>
                  <div style={{
                    width: `${pct}%`, height: "100%", borderRadius: 3,
                    background: pct >= 90
                      ? "linear-gradient(90deg, #f87171, #ef4444)"
                      : "linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))",
                  }}/>
                </div>
              </>
            )}
          </>
        ))}

        {/* ── Profil ─────────────────────────────────────── */}
        {section("Profil", (
          <form onSubmit={saveName} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                Anzeigename
              </label>
              <input style={inputSty} value={editName} onChange={e => setEditName(e.target.value)}
                     placeholder="Dein Name" maxLength={80} />
            </div>
            <button type="submit" style={{
              padding: "0.55rem 1.25rem", borderRadius: "7px", border: "none",
              background: "rgba(124,111,255,0.2)", color: "var(--accent-purple)",
              fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", flexShrink: 0,
            }}>Speichern</button>
            {nameMsg && <div style={{ width: "100%", ...msgStyle(nameMsg) }}>{nameMsg}</div>}
          </form>
        ))}

        {/* ── Passwort ────────────────────────────────────── */}
        {data.user.hasPassword && section("Passwort ändern", (
          <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <input style={inputSty} type="password" placeholder="Aktuelles Passwort"
                   value={curPw} onChange={e => setCurPw(e.target.value)} required />
            <input style={inputSty} type="password" placeholder="Neues Passwort (min. 8 Zeichen)"
                   value={newPw} onChange={e => setNewPw(e.target.value)} required />
            <input style={inputSty} type="password" placeholder="Neues Passwort wiederholen"
                   value={newPw2} onChange={e => setNewPw2(e.target.value)} required />
            <button type="submit" style={{
              padding: "0.55rem 1.25rem", borderRadius: "7px", border: "none", width: "fit-content",
              background: "rgba(124,111,255,0.2)", color: "var(--accent-purple)",
              fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
            }}>Passwort ändern</button>
            {pwMsg && <div style={msgStyle(pwMsg)}>{pwMsg}</div>}
          </form>
        ))}

        {/* ── Mastering-Verlauf ───────────────────────────── */}
        {section("Mastering-Verlauf", (
          data.masters.length === 0
            ? <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Noch keine Masters vorhanden.</p>
            : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      {["Datum", "Datei", "Plattform", "LUFS vorher", "LUFS nachher"].map(h => (
                        <th key={h} style={{ padding: "0.4rem 0.6rem", textAlign: "left", color: "var(--text-muted)",
                                             fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.masters.map(m => (
                      <tr key={m.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "0.5rem 0.6rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                          {fmtDate(m.createdAt)}
                        </td>
                        <td style={{ padding: "0.5rem 0.6rem", color: "var(--text-primary)",
                                     maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {m.originalName}
                        </td>
                        <td style={{ padding: "0.5rem 0.6rem", color: "var(--text-secondary)" }}>{m.platform}</td>
                        <td style={{ padding: "0.5rem 0.6rem", color: "var(--text-secondary)" }}>{fmt(m.lufsIn)}</td>
                        <td style={{ padding: "0.5rem 0.6rem", color: "#6ee7b7" }}>{fmt(m.lufsOut)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        ))}

        {/* ── Gefahrenzone ────────────────────────────────── */}
        {section("Gefahrenzone", (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {data.plan !== "free" && (
              <div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  Abo kündigen: Zugang bleibt bis zum Ende der Laufzeit erhalten.
                </p>
                <a
                  href="https://www.paypal.com/myaccount/autopay/"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    fontSize: "0.85rem", fontWeight: 600, color: "#f59e0b",
                    textDecoration: "none",
                  }}
                >
                  Abo bei PayPal kündigen →
                </a>
              </div>
            )}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.85rem" }}>
              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  style={{
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                    color: "#f87171", borderRadius: "7px", padding: "0.5rem 1rem",
                    fontSize: "0.85rem", cursor: "pointer", fontWeight: 600,
                  }}
                >
                  Konto löschen
                </button>
              ) : (
                <div style={{
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: "8px", padding: "1rem",
                }}>
                  <p style={{ fontSize: "0.85rem", color: "#fca5a5", marginBottom: "0.75rem" }}>
                    <strong>Wirklich löschen?</strong> Alle Daten werden unwiderruflich entfernt.
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={deleteAccount} style={{
                      background: "#ef4444", border: "none", color: "#fff",
                      borderRadius: "6px", padding: "0.45rem 0.9rem",
                      fontSize: "0.82rem", cursor: "pointer", fontWeight: 700,
                    }}>
                      Ja, Konto löschen
                    </button>
                    <button onClick={() => setDeleteConfirm(false)} style={{
                      background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "var(--text-secondary)", borderRadius: "6px", padding: "0.45rem 0.9rem",
                      fontSize: "0.82rem", cursor: "pointer",
                    }}>
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

      </main>
      <Footer />
    </div>
  );
}
