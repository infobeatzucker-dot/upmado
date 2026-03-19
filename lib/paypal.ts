/**
 * PayPal REST API v2 helper
 */

const PAYPAL_BASE = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

let cachedToken: { token: string; expires: number } | null = null;

export async function getPayPalAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const secret   = process.env.PAYPAL_CLIENT_SECRET!;

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error("PayPal auth failed");

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.token;
}

export async function paypalFetch(path: string, options: RequestInit = {}) {
  const token = await getPayPalAccessToken();
  const res = await fetch(`${PAYPAL_BASE}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  return res;
}

// ─── Orders (Pay-per-Download) ─────────────────────────────────────────────

export async function createPayPalOrder(amountEur: string, masterId: string) {
  const res = await paypalFetch("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        amount: { currency_code: "EUR", value: amountEur },
        description: `UpMaDo – Download (${masterId})`,
        custom_id: masterId,
      }],
      application_context: {
        brand_name: "UpMaDo",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXTAUTH_URL}/api/paypal/capture-order`,
        cancel_url: `${process.env.NEXTAUTH_URL}/`,
      },
    }),
  });
  return res.json();
}

export async function capturePayPalOrder(orderId: string) {
  const res = await paypalFetch(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return res.json();
}

// ─── Subscriptions ─────────────────────────────────────────────────────────

const PLAN_IDS: Record<string, string> = {
  creator_monthly: process.env.PAYPAL_PLAN_CREATOR_MONTHLY || "",
  creator_annual:  process.env.PAYPAL_PLAN_CREATOR_ANNUAL  || "",
  pro_monthly:     process.env.PAYPAL_PLAN_PRO_MONTHLY     || "",
  pro_annual:      process.env.PAYPAL_PLAN_PRO_ANNUAL      || "",
  proplus_monthly: process.env.PAYPAL_PLAN_PROPLUS_MONTHLY || "",
  proplus_annual:  process.env.PAYPAL_PLAN_PROPLUS_ANNUAL  || "",
  studio_monthly:  process.env.PAYPAL_PLAN_STUDIO_MONTHLY  || "",
  studio_annual:   process.env.PAYPAL_PLAN_STUDIO_ANNUAL   || "",
};

export async function createPayPalSubscription(planType: string, userId?: string) {
  const planId = PLAN_IDS[planType];
  if (!planId) throw new Error(`Unknown plan type: ${planType}`);

  const res = await paypalFetch("/v1/billing/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      custom_id: userId || "",
      application_context: {
        brand_name: "UpMaDo",
        user_action: "SUBSCRIBE_NOW",
        payment_method: { payer_selected: "PAYPAL", payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED" },
        return_url: `${process.env.NEXTAUTH_URL}/api/paypal/subscription-success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
      },
    }),
  });
  return res.json();
}

// ─── Webhook Verification ──────────────────────────────────────────────────

export async function verifyWebhookSignature(
  headers: Record<string, string>,
  body: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID!;

  const res = await paypalFetch("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify({
      auth_algo:         headers["paypal-auth-algo"],
      cert_url:          headers["paypal-cert-url"],
      transmission_id:   headers["paypal-transmission-id"],
      transmission_sig:  headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id:        webhookId,
      webhook_event:     JSON.parse(body),
    }),
  });

  const data = await res.json();
  return data.verification_status === "SUCCESS";
}
