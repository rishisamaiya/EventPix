import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS, PlanId } from "@/lib/plans";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const plan = PLANS[planId as PlanId];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Update payment history
    await admin
      .from("payment_history")
      .update({
        razorpay_payment_id,
        status: "captured",
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", user.id);

    // Create or update subscription
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year validity

    const { data: subscription, error: subError } = await admin
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan: planId,
        status: "active",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: plan.price,
        currency: "INR",
        max_events: plan.maxEvents,
        max_storage_gb: plan.maxStorageGB,
        max_guests: plan.maxGuests,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (subError) {
      console.error("Subscription error:", subError);
      return NextResponse.json(
        { error: "Failed to activate subscription" },
        { status: 500 }
      );
    }

    // Update payment history with subscription ID
    await admin
      .from("payment_history")
      .update({ subscription_id: subscription.id })
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: planId,
        planName: plan.name,
        status: "active",
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
