import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    // Verify webhook signature
    const headers: Record<string, string> = {
      "paypal-auth-algo":         req.headers.get("paypal-auth-algo") || "",
      "paypal-cert-url":          req.headers.get("paypal-cert-url") || "",
      "paypal-transmission-id":   req.headers.get("paypal-transmission-id") || "",
      "paypal-transmission-sig":  req.headers.get("paypal-transmission-sig") || "",
      "paypal-transmission-time": req.headers.get("paypal-transmission-time") || "",
    };

    // Skip verification in sandbox/dev if PAYPAL_WEBHOOK_ID not set
    if (process.env.PAYPAL_WEBHOOK_ID) {
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
      case "PAYMENT.CAPTURE.COMPLETED": {
        // Pay-per-download purchase completed
        const capture = event.resource;
        const masterId = capture.custom_id;
        const amount   = capture.amount?.value;

        console.log(`Download purchase complete: master=${masterId} amount=€${amount}`);

        // TODO: Update Order record in DB:
        // await prisma.order.updateMany({ where: { paypalOrderId: capture.id }, data: { status: "completed" } })
        break;
      }

      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        // New subscription activated
        const sub = event.resource;
        const userId  = sub.custom_id;
        const planId  = sub.plan_id;

        console.log(`Subscription activated: user=${userId} plan=${planId}`);

        // TODO: Create/update Subscription record in DB
        // const validUntil = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        // await prisma.subscription.create({ ... })
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const sub = event.resource;
        console.log(`Subscription ${eventType}: ${sub.id}`);

        // TODO: Update subscription status in DB
        break;
      }

      case "BILLING.SUBSCRIPTION.RENEWED": {
        const sub = event.resource;
        console.log(`Subscription renewed: ${sub.id}`);

        // TODO: Extend validUntil by 30 days
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
