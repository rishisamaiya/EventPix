import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLANS, PlanId } from "@/lib/plans";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get active subscription (if any)
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, max_events, max_storage_gb, max_guests, expires_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const planId: PlanId =
    subscription &&
    subscription.expires_at &&
    new Date(subscription.expires_at) > new Date()
      ? (subscription.plan as PlanId)
      : "free";

  const plan = PLANS[planId];
  const limits = {
    planId,
    planName: plan.name,
    maxEvents: subscription?.max_events ?? plan.maxEvents,
    maxStorageGB: subscription?.max_storage_gb ?? plan.maxStorageGB,
    maxGuests: subscription?.max_guests ?? plan.maxGuests,
  };

  // Count current active/draft events
  const { count: eventCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("host_id", user.id)
    .neq("status", "archived");

  return NextResponse.json({
    ...limits,
    usage: {
      events: eventCount ?? 0,
    },
    canCreateEvent:
      limits.maxEvents === -1 || (eventCount ?? 0) < limits.maxEvents,
  });
}
