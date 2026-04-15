import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        name,
        email,
        subject,
        message,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      console.error("Support ticket error:", error);
      return NextResponse.json(
        { error: "Failed to create support ticket" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ticketId: data.id,
      message: "Support ticket created successfully",
    });
  } catch (err) {
    console.error("Support ticket error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
