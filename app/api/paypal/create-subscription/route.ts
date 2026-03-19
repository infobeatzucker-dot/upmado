import { NextRequest, NextResponse } from "next/server";
import { createPayPalSubscription } from "@/lib/paypal";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const VALID_PLANS = [
  "creator_monthly", "creator_annual",
  "pro_monthly",     "pro_annual",
  "proplus_monthly", "proplus_annual",
  "studio_monthly",  "studio_annual",
];

export async function POST(req: NextRequest) {
  try {
    const { plan_type } = await req.json();

    if (!VALID_PLANS.includes(plan_type)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    if (!process.env.PAYPAL_CLIENT_ID) {
      return NextResponse.json({ error: "PayPal not configured" }, { status: 503 });
    }

    // Get userId from NextAuth session (optional — anonymous subscribers set custom_id to "")
    const session = await getServerSession(authOptions);
    const userId  = session?.user?.id ?? "";

    const subscription = await createPayPalSubscription(plan_type, userId || undefined);

    if (subscription.status === "APPROVAL_PENDING") {
      const approvalUrl = subscription.links?.find(
        (l: { rel: string; href: string }) => l.rel === "approve"
      )?.href;

      return NextResponse.json({
        subscription_id: subscription.id,
        approval_url:    approvalUrl,
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
