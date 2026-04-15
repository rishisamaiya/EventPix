"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard, CheckCircle2, ArrowUpRight,
  Package, HardDrive, Users, Receipt, Loader2, Zap,
} from "lucide-react";
import { PLANS, PlanId } from "@/lib/plans";
import { PaymentModal } from "@/components/payment-modal";
import { createClient } from "@/lib/supabase/client";

const TIER_ORDER: PlanId[] = ["basic", "standard", "pro", "premium"];

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      const [subRes, payRes, evtRes] = await Promise.all([
        supabase.from("subscriptions").select("*").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("payment_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("events").select("*", { count: "exact", head: true }).eq("host_id", user.id),
      ]);

      setSubscription(subRes.data ?? null);
      setPayments(payRes.data ?? []);
      setEventCount(evtRes.count ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  function handleUpgradeSuccess(sub: any) {
    setSelectedPlan(null);
    setSubscription(sub);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const currentPlanId = (subscription?.plan as PlanId) ?? "free";
  const currentPlan = PLANS[currentPlanId];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your plan, view usage, and payment history.</p>
      </div>

      {/* Current Plan */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
            <h2 className="text-2xl font-bold">{currentPlan.name}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Active</span>
              {subscription?.expires_at && (
                <span className="text-xs text-muted-foreground">
                  Expires {new Date(subscription.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold">{currentPlan.priceDisplay}</p>
            <p className="text-xs text-muted-foreground">{currentPlan.period}</p>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" /> Events
            </div>
            <p className="text-xl font-bold">
              {eventCount}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {currentPlan.maxEvents === -1 ? "∞" : currentPlan.maxEvents}
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <HardDrive className="h-4 w-4" /> Storage
            </div>
            <p className="text-xl font-bold">
              {currentPlan.maxStorageGB} GB
              <span className="text-sm font-normal text-muted-foreground ml-1">limit</span>
            </p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" /> Guests
            </div>
            <p className="text-xl font-bold">
              {currentPlan.maxGuests === -1 ? "Unlimited" : currentPlan.maxGuests}
              {currentPlan.maxGuests !== -1 && <span className="text-sm font-normal text-muted-foreground ml-1">per event</span>}
            </p>
          </div>
        </div>

        {/* Current plan features */}
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {currentPlan.features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" /> {f}
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Plans */}
      {currentPlanId !== "premium" && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">Upgrade Your Plan</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TIER_ORDER.filter((id) => {
              const planPrice = PLANS[id].price;
              const currentPrice = currentPlan.price;
              return planPrice > currentPrice;
            }).map((planId) => {
              const plan = PLANS[planId];
              const isPopular = "popular" in plan && plan.popular;
              return (
                <button
                  key={planId}
                  onClick={() => setSelectedPlan(planId)}
                  className={`group relative rounded-xl border-2 p-4 text-left transition hover:shadow-md ${
                    isPopular
                      ? "border-blue-500 bg-blue-50/50 hover:bg-blue-50"
                      : "border-border hover:border-blue-300"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-2.5 left-3 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      POPULAR
                    </span>
                  )}
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{plan.name}</p>
                  <p className="mt-0.5 text-xl font-extrabold text-slate-900">{plan.priceDisplay}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{plan.period}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all">
                    Upgrade <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            Payment History
          </h3>
        </div>
        {payments.length === 0 ? (
          <div className="px-6 py-10 text-center text-muted-foreground">
            <CreditCard className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p>No payments yet</p>
            <p className="text-sm">Your payment history will appear here after your first purchase.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {["Date", "Plan", "Amount", "Status"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/20">
                  <td className="px-6 py-3 text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-3 font-medium capitalize">{p.plan}</td>
                  <td className="px-6 py-3">₹{(p.amount / 100).toLocaleString("en-IN")}</td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.status === "captured" ? "bg-green-100 text-green-700"
                      : p.status === "pending" ? "bg-yellow-100 text-yellow-700"
                      : p.status === "refunded" ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Need help with billing?{" "}
        <Link href="/contact" className="font-medium text-primary hover:underline">Contact support</Link>
        {" · "}
        <Link href="/refund" className="font-medium text-primary hover:underline">Refund policy</Link>
      </p>

      {selectedPlan && (
        <PaymentModal
          planId={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handleUpgradeSuccess}
        />
      )}
    </div>
  );
}
