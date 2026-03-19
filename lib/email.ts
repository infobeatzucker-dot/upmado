import { Resend } from "resend";

// Lazy initialization — avoids "Missing API key" error at build time
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

const FROM = process.env.EMAIL_FROM ?? "noreply@upmado.com";

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const html = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#1a1a2e;border:1px solid rgba(124,111,255,0.2);border-radius:14px;overflow:hidden;">
    <div style="padding:28px 32px 0;text-align:center;">
      <span style="font-size:1.4rem;font-weight:800;letter-spacing:-0.02em;">
        <span style="color:#a855f7">Up</span><span style="color:#06b6d4">Ma</span><span style="color:#f59e0b">Do</span>
      </span>
    </div>
    <div style="padding:28px 32px 32px;">
      <h1 style="color:#fff;font-size:1.25rem;font-weight:700;margin:0 0 12px;">Passwort zurücksetzen</h1>
      <p style="color:#9ca3af;font-size:0.92rem;line-height:1.6;margin:0 0 24px;">
        Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.
        Klicke auf den Button unten — der Link ist <strong style="color:#fff">15 Minuten</strong> gültig.
      </p>
      <a href="${resetUrl}"
         style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#a855f7,#06b6d4);
                color:#fff;font-weight:700;font-size:0.95rem;border-radius:8px;text-decoration:none;">
        Passwort zurücksetzen →
      </a>
      <p style="color:#6b7280;font-size:0.78rem;margin:20px 0 0;line-height:1.5;">
        Falls du kein Zurücksetzen angefordert hast, kannst du diese E-Mail ignorieren.
        Dein Passwort bleibt unverändert.<br><br>
        Link: <a href="${resetUrl}" style="color:#06b6d4;word-break:break-all;">${resetUrl}</a>
      </p>
    </div>
    <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
      <span style="color:#4b5563;font-size:0.75rem;">© ${new Date().getFullYear()} UpMaDo · Michael Clas</span>
    </div>
  </div>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "UpMaDo – Passwort zurücksetzen",
    html,
  });
}

export async function sendWelcomeEmail(email: string) {
  const html = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#1a1a2e;border:1px solid rgba(124,111,255,0.2);border-radius:14px;overflow:hidden;">
    <div style="padding:28px 32px 0;text-align:center;">
      <span style="font-size:1.4rem;font-weight:800;">
        <span style="color:#a855f7">Up</span><span style="color:#06b6d4">Ma</span><span style="color:#f59e0b">Do</span>
      </span>
    </div>
    <div style="padding:24px 32px 32px;">
      <h1 style="color:#fff;font-size:1.2rem;font-weight:700;margin:0 0 12px;">Willkommen bei UpMaDo! 🎧</h1>
      <p style="color:#9ca3af;font-size:0.92rem;line-height:1.6;margin:0 0 20px;">
        Dein Konto ist aktiv. Du kannst jetzt sofort mit dem kostenlosen Plan mastern —
        3 Masters täglich, MP3 128 kbps, ohne Abo.
      </p>
      <a href="${process.env.NEXTAUTH_URL ?? "https://upmado.com"}"
         style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#a855f7,#06b6d4);
                color:#fff;font-weight:700;font-size:0.92rem;border-radius:8px;text-decoration:none;">
        Jetzt mastern →
      </a>
    </div>
    <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
      <span style="color:#4b5563;font-size:0.75rem;">© ${new Date().getFullYear()} UpMaDo · Michael Clas · info@re-beatz.com</span>
    </div>
  </div>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Willkommen bei UpMaDo 🎧",
    html,
  });
}
