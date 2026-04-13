import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase redirects here after email confirmation / password reset.
// The URL contains a `code` param — we exchange it for a session,
// then forward the user to the right page.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    // If exchange fails, send to login with error
    return NextResponse.redirect(`${origin}/login?error=link-expired`);
  }

  // No code — just redirect home
  return NextResponse.redirect(`${origin}/`);
}
