import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, getTierFromPlan } from "@/lib/auth";

// ── GET /api/account ─────────────────────────────────────────────────
// Returns user profile + active subscription + last 30 masters
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: {
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      masters: {
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true, originalName: true, platform: true, preset: true,
          status: true, preAnalysis: true, postAnalysis: true, createdAt: true,
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });

  const sub = user.subscriptions[0] ?? null;

  // Parse LUFS from analysis JSON
  const mastersWithLufs = user.masters.map(m => {
    let lufsIn = null, lufsOut = null;
    try { const pre = JSON.parse(m.preAnalysis ?? "{}"); lufsIn = pre.integrated_loudness ?? null; } catch {}
    try { const post = JSON.parse(m.postAnalysis ?? "{}"); lufsOut = post.integrated_loudness ?? null; } catch {}
    return { id: m.id, originalName: m.originalName, platform: m.platform,
             preset: m.preset, status: m.status, lufsIn, lufsOut,
             createdAt: m.createdAt };
  });

  return NextResponse.json({
    user: {
      id:    user.id,
      email: user.email,
      name:  user.name,
      image: user.image,
      hasPassword: !!user.password,
      createdAt: user.createdAt,
    },
    plan:         sub?.planType ?? "free",
    tier:         getTierFromPlan(sub?.planType),
    mastersUsed:  sub?.mastersUsed ?? 0,
    mastersLimit: sub?.mastersLimit ?? 0,
    validUntil:   sub?.validUntil ?? null,
    subStatus:    sub?.status ?? null,
    masters: mastersWithLufs,
  });
}

// ── PATCH /api/account ───────────────────────────────────────────────
// Update name or change password
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const body = await req.json();
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });

  const updates: Record<string, string> = {};

  // Update name
  if (typeof body.name === "string") {
    updates.name = body.name.trim().slice(0, 80);
  }

  // Change password
  if (body.currentPassword && body.newPassword) {
    if (!user.password)
      return NextResponse.json({ error: "Kein Passwort-Login (Google-Konto)" }, { status: 400 });
    const valid = await verifyPassword(body.currentPassword, user.password);
    if (!valid)
      return NextResponse.json({ error: "Aktuelles Passwort falsch" }, { status: 400 });
    if (body.newPassword.length < 8)
      return NextResponse.json({ error: "Neues Passwort muss mindestens 8 Zeichen haben" }, { status: 400 });
    updates.password = await hashPassword(body.newPassword);
  }

  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: "Keine Änderungen" }, { status: 400 });

  await db.user.update({ where: { id: user.id }, data: updates });
  return NextResponse.json({ ok: true });
}

// ── DELETE /api/account ──────────────────────────────────────────────
// Delete account + all data (DSGVO Art. 17)
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });

  // Cascade deletes handle subscriptions, sessions, masters, orders
  await db.user.delete({ where: { id: user.id } });

  return NextResponse.json({ ok: true });
}
