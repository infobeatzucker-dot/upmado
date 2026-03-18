/**
 * Simple session-based auth helpers (no NextAuth dependency at runtime)
 * Uses signed tokens stored in SQLite via Prisma
 */

import { cookies } from "next/headers";
import { randomBytes, createHmac } from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-change-me";

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function signToken(token: string): string {
  const hmac = createHmac("sha256", SECRET);
  hmac.update(token);
  return `${token}.${hmac.digest("hex")}`;
}

export function verifyToken(signed: string): string | null {
  const parts = signed.split(".");
  if (parts.length !== 2) return null;
  const [token, sig] = parts;
  const hmac = createHmac("sha256", SECRET);
  hmac.update(token);
  const expected = hmac.digest("hex");
  if (sig !== expected) return null;
  return token;
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("session")?.value;
  if (!raw) return null;
  return verifyToken(raw);
}

// Tier resolution based on active subscription
export type UserTier = "free" | "paid" | "pro";

export function getTierFromPlan(planType: string | null | undefined): UserTier {
  if (!planType) return "free";
  if (planType.startsWith("pro")) return "pro";
  return "paid";
}

export function canDownloadFormat(tier: UserTier, format: string): boolean {
  const free = ["mp3128"];
  const paid = ["mp3128", "mp3320", "wav16", "wav24", "flac", "aac256"];
  const pro  = [...paid, "wav32"];

  if (tier === "pro")  return pro.includes(format);
  if (tier === "paid") return paid.includes(format);
  return free.includes(format);
}
