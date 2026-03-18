"use client";

import { useEffect, useRef, useState } from "react";

interface PayPalDownloadButtonProps {
  masterId: string;
  onSuccess: (token: string) => void;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: object) => { render: (el: HTMLElement) => void };
    };
  }
}

export function PayPalDownloadButton({ masterId, onSuccess }: PayPalDownloadButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setError("PayPal not configured");
      return;
    }

    // Load PayPal JS SDK
    if (window.paypal) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&intent=capture`;
    script.onload = () => setLoaded(true);
    script.onerror = () => setError("Failed to load PayPal SDK");
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || !window.paypal) return;

    containerRef.current.innerHTML = "";

    window.paypal.Buttons({
      style: {
        layout: "horizontal",
        color: "gold",
        shape: "rect",
        label: "pay",
        height: 40,
      },
      createOrder: async () => {
        const res = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ master_id: masterId }),
        });
        const data = await res.json();
        if (!data.order_id) throw new Error(data.error || "Order creation failed");
        return data.order_id;
      },
      onApprove: async (data: { orderID: string }) => {
        const res = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: data.orderID }),
        });
        const capture = await res.json();
        if (capture.success && capture.download_token) {
          onSuccess(capture.download_token);
        }
      },
      onError: (err: unknown) => {
        console.error("PayPal error:", err);
        setError("Payment failed. Please try again.");
      },
    }).render(containerRef.current!);
  }, [loaded, masterId, onSuccess]);

  if (error) {
    return (
      <p className="text-xs text-center" style={{ color: "var(--accent-red)" }}>
        {error}
      </p>
    );
  }

  if (!loaded) {
    return (
      <div className="flex justify-center">
        <div
          className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "var(--accent-gold)" }}
        />
      </div>
    );
  }

  return <div ref={containerRef} />;
}

// ─── Subscription Button ────────────────────────────────────────────────────

interface PayPalSubscribeButtonProps {
  planType: string;
  label: string;
}

export function PayPalSubscribeButton({ planType, label }: PayPalSubscribeButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) return;

    if (window.paypal) { setLoaded(true); return; }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription&currency=EUR`;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || !window.paypal) return;

    containerRef.current.innerHTML = "";

    window.paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "rect", label: "subscribe" },
      createSubscription: async (_data: unknown, actions: { subscription: { create: (opts: object) => Promise<string> } }) => {
        const res = await fetch("/api/paypal/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan_type: planType }),
        });
        const data = await res.json();
        if (data.approval_url) {
          window.location.href = data.approval_url;
        }
        return data.subscription_id;
      },
      onApprove: () => {
        setSuccess(true);
      },
    }).render(containerRef.current!);
  }, [loaded, planType]);

  if (success) {
    return (
      <div
        className="text-center text-sm font-medium py-2"
        style={{ color: "var(--accent-cyan)" }}
      >
        ✓ Subscription activated!
      </div>
    );
  }

  return <div ref={containerRef} />;
}
