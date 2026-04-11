import { NextRequest, NextResponse } from "next/server";
import { getTokensFromCode } from "@/lib/google-drive";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const eventId = searchParams.get("state");

  if (!code || !eventId) {
    return NextResponse.redirect(`${origin}/dashboard?error=google_auth_failed`);
  }

  try {
    const tokens = await getTokensFromCode(code);

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${origin}/login`);
    }

    await supabase
      .from("events")
      .update({
        storage_type: "google_drive",
        cloud_config: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
        },
      })
      .eq("id", eventId)
      .eq("host_id", user.id);

    return NextResponse.redirect(
      `${origin}/dashboard/events/${eventId}?google=connected`
    );
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(
      `${origin}/dashboard/events/${eventId}?error=google_auth_failed`
    );
  }
}
