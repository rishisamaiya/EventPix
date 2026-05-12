"use client";

import { useState, useEffect } from "react";
import { X, Check, CreditCard, Loader2, CheckCircle2, Shield } from "lucide-react";
import { PLANS, PlanId } from "@/lib/plans";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentModalProps = {
  planId: PlanId;
  onClose: () => void;
  onSuccess: (subscription: any) => void;
};

export function PaymentModal({ planId, onClose, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const plan = PLANS[planId];

  // Load Razorpay checkout script
  useEffect(() => {
    if (document.getElementById("razorpay-script")) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setError("Failed to load payment gateway");
    document.body.appendChild(script);
  }, []);

  async function handlePayment() {
    setLoading(true);
    setError("");

    try {
      // 1. Create order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        throw new Error(data.error || "Failed to create order");
      }

      const orderData = await orderRes.json();

      // 2. Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "EventPix",
        description: `${plan.name} Plan — ${plan.priceDisplay}`,
        order_id: orderData.orderId,
        prefill: orderData.prefill,
        theme: {
          color: "#3B82F6",
          backdrop_color: "rgba(0,0,0,0.7)",
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        handler: async (response: any) => {
          // 3. Verify payment
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId,
              }),
            });

            if (!verifyRes.ok) {
              const data = await verifyRes.json();
              throw new Error(data.error || "Verification failed");
            }

            const result = await verifyRes.json();
            onSuccess(result.subscription);
          } catch (err: any) {
            setError(err.message || "Payment verification failed");
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setError(
          response.error?.description || "Payment failed. Please try again."
        );
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upgrade to {plan.name}</h2>
            <p className="text-sm text-slate-500">
              One-time payment · Instant activation
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Plan Details */}
        <div className="p-6">
          <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-sky-50 p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-sm font-medium text-slate-600">
                {plan.name} Plan
              </span>
              <div>
                <span className="text-3xl font-extrabold text-slate-900">
                  {plan.priceDisplay}
                </span>
                <span className="ml-1 text-sm text-slate-400">
                  {plan.period}
                </span>
              </div>
            </div>
            <ul className="space-y-2">
              {plan.features.slice(0, 5).map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                  {f}
                </li>
              ))}
              {plan.features.length > 5 && (
                <li className="text-xs text-blue-500 font-medium">
                  + {plan.features.length - 5} more features
                </li>
              )}
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading || !scriptLoaded}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-sky-400 py-3.5 font-bold text-white shadow-lg shadow-blue-200/50 transition hover:from-blue-600 hover:to-sky-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Pay {plan.priceDisplay}
              </>
            )}
          </button>

          {/* Trust badges */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              Secure payment
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Powered by Razorpay
            </span>
          </div>
          <p className="mt-3 text-center text-[11px] text-slate-300">
            UPI · Cards · Net Banking · Wallets accepted
          </p>
        </div>
      </div>
    </div>
  );
}
