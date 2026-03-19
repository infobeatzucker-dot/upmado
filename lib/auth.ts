/**
 * Auth helpers — password hashing, tier resolution, download token signing
 */

import { cookies } from "next/headers";
import { randomBytes, createHmac } from "crypto";
import bcrypt from "bcryptjs";

const SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-change-me";

// ── Password hashing ────────────────────────────────────────────────
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── HMAC session tokens (legacy + download tokens) ──────────────────
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

// ── Tier resolution ─────────────────────────────────────────────────
export type UserTier = "free" | "paid" | "pro";

/**
 * Map plan type string → download tier
 * pro  = proplus_* | studio_* (WAV 32-bit access)
 * paid = creator_* | pro_* | ppu
 * free = everything else
 */
export function getTierFromPlan(planType: string | null | undefined): UserTier {
  if (!planType) return "free";
  if (planType === "ppu") return "paid";
  if (planType.startsWith("proplus") || planType.startsWith("studio")) return "pro";
  if (planType.startsWith("creator") || planType.startsWith("pro_")) return "paid";
  return "free";
}

export function canDownloadFormat(tier: UserTier, format: string): boolean {
  const free = ["mp3128"];
  const paid = ["mp3128", "mp3320", "wav16", "wav24", "flac", "aac256"];
  const pro  = [...paid, "wav32"];

  if (tier === "pro")  return pro.includes(format);
  if (tier === "paid") return paid.includes(format);
  return free.includes(format);
}

// ── Masters limit per plan ──────────────────────────────────────────
export function getMastersLimit(planType: string | null | undefined): number {
  if (!planType || planType === "free") return 0; // enforced per-day on free tier
  if (planType === "ppu") return 1;
  if (planType.startsWith("creator")) return 25;
  if (planType.startsWith("pro_")) return 100;
  if (planType.startsWith("proplus")) return 250;
  if (planType.startsWith("studio")) return 999999; // unlimited
  return 0;
}
