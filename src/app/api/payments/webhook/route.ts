import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

// Razorpay sends webhook events for payment lifecycle
export async function POST(request: NextRequest) {
  try {
    const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const admin = createAdminClient();

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        await admin
          .from("payment_history")
          .update({ status: "captured" })
          .eq("razorpay_order_id", payment.order_id);
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        await admin
          .from("payment_history")
          .update({ status: "failed" })
          .eq("razorpay_order_id", payment.order_id);
        break;
      }

      case "refund.created":
      case "refund.processed": {
        const refund = event.payload.refund.entity;
        await admin
          .from("payment_history")
          .update({ status: "refunded" })
          .eq("razorpay_payment_id", refund.payment_id);

        // Also cancel the subscription
        const { data: payments } = await admin
          .from("payment_history")
          .select("subscription_id")
          .eq("razorpay_payment_id", refund.payment_id)
          .single();

        if (payments?.subscription_id) {
          await admin
            .from("subscriptions")
            .update({ status: "cancelled" })
            .eq("id", payments.subscription_id);
        }
        break;
      }

      default:
        console.log(`Unhandled Razorpay event: ${event.event}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
