import { NextRequest, NextResponse } from "next/server";
import { createPayPalSubscription } from "@/lib/paypal";
import { getSessionToken } from "@/lib/auth";

const VALID_PLANS = ["basic_monthly", "pro_monthly", "basic_annual", "pro_annual"];

export async function POST(req: NextRequest) {
  try {
    const { plan_type } = await req.json();

    if (!VALID_PLANS.includes(plan_type)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    if (!process.env.PAYPAL_CLIENT_ID) {
      return NextResponse.json({ error: "PayPal not configured" }, { status: 503 });
    }

    // Get optional user session
    const sessionToken = await getSessionToken();

    const subscription = await createPayPalSubscription(plan_type, sessionToken || undefined);

    if (subscription.status === "APPROVAL_PENDING") {
      const approvalUrl = subscription.links?.find(
        (l: { rel: string; href: string }) => l.rel === "approve"
      )?.href;

      return NextResponse.json({
        subscription_id: subscription.id,
        approval_url: approvalUrl,
      });
    }

    return NextResponse.json(
      { error: "Subscription creation failed", details: subscription },
      { status: 400 }
    );
  } catch (err) {
    console.error("Subscription error:", err);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
