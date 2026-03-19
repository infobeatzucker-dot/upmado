import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Download link valid for 2 hours after purchase (matches temp-file cleanup window)
const DOWNLOAD_WINDOW_MS = 2 * 60 * 60 * 1000;

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

    // Extract data from PayPal response
    const captureUnit = capture.purchase_units?.[0]?.payments?.captures?.[0];
    const masterId    = captureUnit?.custom_id             as string | undefined;
    const amountVal   = captureUnit?.amount?.value         as string | undefined;
    const currency    = captureUnit?.amount?.currency_code as string | undefined;

    // Optional user session
    const session = await getServerSession(authOptions);
    const userId  = session?.user?.id ?? null;

    const downloadExpires = new Date(Date.now() + DOWNLOAD_WINDOW_MS);

    // Store order in DB
    const order = await db.order.create({
      data: {
        paypalOrderId:  order_id,
        userId,
        masterId:       masterId ?? null,
        amount:         amountVal ? parseFloat(amountVal) : 0,
        currency:       currency ?? "EUR",
        status:         "completed",
        downloadExpires,
      },
    });

    // Signed download token: base64url(JSON) — validated server-side in /api/download
    const tokenPayload = {
      orderId:   order.id,
      masterId:  masterId ?? null,
      expiresAt: downloadExpires.getTime(),
    };
    const downloadToken = Buffer.from(JSON.stringify(tokenPayload)).toString("base64url");

    return NextResponse.json({
      success:        true,
      master_id:      masterId,
      download_token: downloadToken,
      expires_at:     downloadExpires.toISOString(),
    });
  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.json({ error: "Payment capture failed" }, { status: 500 });
  }
}
