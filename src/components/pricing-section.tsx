"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { PLANS, PlanId } from "@/lib/plans";
import { PaymentModal } from "@/components/payment-modal";

const TIER_ORDER: PlanId[] = ["free", "basic", "standard", "pro", "premium"];

export function PricingSection() {
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);

  function handleSuccess() {
    setSelectedPlan(null);
    window.location.href = "/dashboard/billing";
  }

  return (
    <>
      <div className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {TIER_ORDER.map((planId) => {
          const plan = PLANS[planId];
          const isPopular = "popular" in plan && plan.popular;
          const isFree = plan.price === 0;

          return (
            <div
              key={planId}
              className={`card-3d rounded-3xl border bg-white p-6 ${
                isPopular
                  ? "relative border-2 border-blue-500 shadow-2xl shadow-blue-100/80 xl:-mt-4"
                  : "border-blue-100"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-blue-500 to-sky-400 px-4 py-1 text-[10px] font-bold text-white shadow-lg">
                  MOST POPULAR
                </div>
              )}

              <p className={`mb-2 text-[10px] font-bold uppercase tracking-widest ${isPopular ? "text-blue-500" : "text-slate-400"}`}>
                {plan.name}
              </p>
              <div className="mb-0.5">
                <span className="text-4xl font-extrabold text-slate-900">
                  {plan.priceDisplay}
                </span>
              </div>
              <p className="mb-5 text-xs text-slate-400">{plan.period}</p>

              {isFree ? (
                <Link
                  href="/signup"
                  className="mb-6 block rounded-xl border-2 border-blue-200 bg-white py-2.5 text-center text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                >
                  Get Started Free
                </Link>
              ) : (
                <button
                  onClick={() => setSelectedPlan(planId)}
                  className={`mb-6 w-full rounded-xl py-2.5 text-sm font-bold transition ${
                    isPopular
                      ? "bg-gradient-to-r from-blue-500 to-sky-400 text-white shadow-lg shadow-blue-200 hover:from-blue-600 hover:to-sky-500"
                      : "border-2 border-blue-200 bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {isPopular ? (
                    <span className="flex items-center justify-center gap-1.5">
                      Get Started <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    "Get Started"
                  )}
                </button>
              )}

              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-500">
                    <Check className={`h-3.5 w-3.5 flex-shrink-0 ${isPopular ? "text-blue-500" : "text-blue-400"}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-slate-400">
        All plans include AI face search · No hidden fees · Cancel anytime
      </p>

      {selectedPlan && (
        <PaymentModal
          planId={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
