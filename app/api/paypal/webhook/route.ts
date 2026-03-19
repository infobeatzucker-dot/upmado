import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paypal";
import { db } from "@/lib/db";
import { getMastersLimit } from "@/lib/auth";

// ── Reverse map PayPal plan IDs → planType strings ──────────────────────────
function getPlanTypeFromPlanId(planId: string): string | null {
  const map: Record<string, string> = {
    [process.env.PAYPAL_PLAN_CREATOR_MONTHLY  || "__"]: "creator_monthly",
    [process.env.PAYPAL_PLAN_CREATOR_ANNUAL   || "__"]: "creator_annual",
    [process.env.PAYPAL_PLAN_PRO_MONTHLY      || "__"]: "pro_monthly",
    [process.env.PAYPAL_PLAN_PRO_ANNUAL       || "__"]: "pro_annual",
    [process.env.PAYPAL_PLAN_PROPLUS_MONTHLY  || "__"]: "proplus_monthly",
    [process.env.PAYPAL_PLAN_PROPLUS_ANNUAL   || "__"]: "proplus_annual",
    [process.env.PAYPAL_PLAN_STUDIO_MONTHLY   || "__"]: "studio_monthly",
    [process.env.PAYPAL_PLAN_STUDIO_ANNUAL    || "__"]: "studio_annual",
  };
  return map[planId] ?? null;
}

function isAnnual(planType: string): boolean {
  return planType.endsWith("_annual");
}

function nextValidUntil(planType: string): Date {
  const days = isAnnual(planType) ? 366 : 31;
  return new Date(Date.now() + days * 24 * 3600 * 1000);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    // Verify webhook signature (skip in dev if not configured)
    if (process.env.PAYPAL_WEBHOOK_ID) {
      const headers: Record<string, string> = {
        "paypal-auth-algo":         req.headers.get("paypal-auth-algo")         || "",
        "paypal-cert-url":          req.headers.get("paypal-cert-url")          || "",
        "paypal-transmission-id":   req.headers.get("paypal-transmission-id")   || "",
        "paypal-transmission-sig":  req.headers.get("paypal-transmission-sig")  || "",
        "paypal-transmission-time": req.headers.get("paypal-transmission-time") || "",
      };
      const valid = await verifyWebhookSignature(headers, body);
      if (!valid) {
        console.warn("PayPal webhook signature invalid");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    const eventType: string = event.event_type;
    console.log(`PayPal webhook: ${eventType}`);

    switch (eventType) {

      // ── New subscription activated ─────────────────────────────────────────
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const sub    = event.resource;
        const userId = sub.custom_id as string | undefined;
        const planId = sub.plan_id   as string | undefined;

        if (!userId || !planId) {
          console.warn("ACTIVATED: missing custom_id or plan_id", { userId, planId });
          break;
        }

        const planType = getPlanTypeFromPlanId(planId);
        if (!planType) {
          console.warn(`ACTIVATED: unknown PayPal plan_id ${planId}`);
          break;
        }

        const validUntil     = nextValidUntil(planType);
        const mastersLimit   = getMastersLimit(planType);

        // Upsert: if sub already exists update it, otherwise create
        await db.subscription.upsert({
          where:  { paypalSubscriptionId: sub.id },
          update: { status: "active", validUntil, updatedAt: new Date() },
          create: {
            userId,
            planType,
            paypalSubscriptionId: sub.id,
            status:       "active",
            validUntil,
            mastersUsed:  0,
            mastersLimit,
          },
        });

        console.log(`Subscription activated: user=${userId} plan=${planType} until=${validUntil.toISOString()}`);
        break;
      }

      // ── Subscription renewed (monthly/annual billing cycle) ───────────────
      case "BILLING.SUBSCRIPTION.RENEWED": {
        const sub = event.resource;

        const existing = await db.subscription.findUnique({
          where: { paypalSubscriptionId: sub.id },
        });

        if (!existing) {
          console.warn(`RENEWED: subscription ${sub.id} not found in DB`);
          break;
        }

        const validUntil = nextValidUntil(existing.planType);

        await db.subscription.update({
          where: { paypalSubscriptionId: sub.id },
          data:  { mastersUsed: 0, validUntil, status: "active", updatedAt: new Date() },
        });

        console.log(`Subscription renewed: ${sub.id} until ${validUntil.toISOString()}`);
        break;
      }

      // ── Subscription cancelled or suspended ───────────────────────────────
      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const sub    = event.resource;
        const status = eventType === "BILLING.SUBSCRIPTION.CANCELLED" ? "cancelled" : "suspended";

        await db.subscription.updateMany({
          where: { paypalSubscriptionId: sub.id },
          data:  { status, updatedAt: new Date() },
        });

        console.log(`Subscription ${status}: ${sub.id}`);
        break;
      }

      // ── PPU payment captured ──────────────────────────────────────────────
      case "PAYMENT.CAPTURE.COMPLETED": {
        const capture = event.resource;
        const orderId = capture.supplementary_data?.related_ids?.order_id ?? capture.id;

        await db.order.updateMany({
          where: { paypalOrderId: orderId },
          data:  { status: "completed" },
        });

        console.log(`Payment capture completed: orderId=${orderId} amount=${capture.amount?.value} ${capture.amount?.currency_code}`);
        break;
      }

      default:
        console.log(`Unhandled PayPal event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
