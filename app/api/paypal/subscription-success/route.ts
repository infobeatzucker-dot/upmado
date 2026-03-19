import { NextRequest, NextResponse } from "next/server";

/**
 * PayPal redirects here after the user approves a subscription.
 * The actual subscription activation is handled by the webhook
 * (BILLING.SUBSCRIPTION.ACTIVATED). This route just sends the
 * user to a friendly success page.
 *
 * Query params from PayPal:
 *   subscription_id  — the new subscription ID
 *   ba_token         — billing agreement token (legacy)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subscriptionId = searchParams.get("subscription_id") ?? "";

  const base = process.env.NEXTAUTH_URL ?? "https://upmado.com";

  // Redirect to account page with success flag so the UI can show a toast
  const redirectUrl = new URL("/account", base);
  if (subscriptionId) redirectUrl.searchParams.set("subscribed", "1");

  return NextResponse.redirect(redirectUrl.toString());
}
