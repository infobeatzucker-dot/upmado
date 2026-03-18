import { NextRequest, NextResponse } from "next/server";
import { generateSessionToken, signToken } from "@/lib/auth";

// Simple email-based auth (magic link / OTP flow placeholder)
// In production: send email with link, verify OTP, create session

export async function POST(req: NextRequest) {
  try {
    const { action, email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    if (action === "login") {
      // TODO: Send magic link email
      // For now: create session directly (dev mode)
      const token = generateSessionToken();
      const signed = signToken(token);

      const response = NextResponse.json({ success: true, message: "Login link sent" });
      response.cookies.set("session", signed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 3600, // 30 days
        path: "/",
      });

      return response;
    }

    if (action === "logout") {
      const response = NextResponse.json({ success: true });
      response.cookies.delete("session");
      return response;
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Check session status
  const session = req.cookies.get("session");
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    // TODO: Fetch user from DB using session token
  });
}
