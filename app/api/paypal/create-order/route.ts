import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";

// Price per download in EUR
const DOWNLOAD_PRICE = "2.99";

export async function POST(req: NextRequest) {
  try {
    const { master_id } = await req.json();

    if (!master_id) {
      return NextResponse.json({ error: "master_id required" }, { status: 400 });
    }

    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "PayPal not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET." },
        { status: 503 }
      );
    }

    const order = await createPayPalOrder(DOWNLOAD_PRICE, master_id);

    return NextResponse.json({
      order_id: order.id,
      status: order.status,
      links: order.links,
    });
  } catch (err) {
    console.error("PayPal create-order error:", err);
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
  }
}
