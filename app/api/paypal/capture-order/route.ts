import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return NextResponse.json({ error: "order_id required" }, { status: 400 });
    }

    const capture = await capturePayPalOrder(order_id);

    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Payment not completed", status: capture.status },
        { status: 400 }
      );
    }

    // Extract master_id from custom_id
    const masterId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id;

    // TODO: Store order in database, generate signed download token
    const downloadToken = Buffer.from(
      JSON.stringify({ master_id: masterId, paid: true, expires: Date.now() + 7 * 24 * 3600 * 1000 })
    ).toString("base64");

    return NextResponse.json({
      success: true,
      master_id: masterId,
      download_token: downloadToken,
      expires_in_days: 7,
    });
  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.json({ error: "Payment capture failed" }, { status: 500 });
  }
}
