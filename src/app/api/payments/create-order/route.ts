import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLANS, PlanId } from "@/lib/plans";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await request.json();

    if (!planId || !(planId in PLANS)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const plan = PLANS[planId as PlanId];

    if (plan.price === 0) {
      return NextResponse.json(
        { error: "Free plan doesn't require payment" },
        { status: 400 }
      );
    }

    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    // Create Razorpay order via REST API
    const receiptId = `rcpt_${crypto.randomBytes(8).toString("hex")}`;

    const orderData = {
      amount: plan.price, // in paise
      currency: "INR",
      receipt: receiptId,
      notes: {
        user_id: user.id,
        user_email: user.email,
        plan_id: planId,
        plan_name: plan.name,
      },
    };

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!rzpResponse.ok) {
      const err = await rzpResponse.json();
      console.error("Razorpay order error:", err);
      return NextResponse.json(
        { error: "Failed to create payment order" },
        { status: 500 }
      );
    }

    const order = await rzpResponse.json();

    // Store pending payment in history
    await supabase.from("payment_history").insert({
      user_id: user.id,
      razorpay_order_id: order.id,
      amount: plan.price,
      currency: "INR",
      status: "pending",
      plan: planId,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
      plan: {
        id: planId,
        name: plan.name,
        price: plan.priceDisplay,
      },
      prefill: {
        email: user.email,
        name: user.user_metadata?.full_name || "",
      },
    });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
