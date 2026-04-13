"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Supabase puts auth errors in the URL hash fragment when a link
// is expired/invalid: #error=access_denied&error_code=otp_expired&...
// This component detects those and redirects to a helpful page.
export function AuthErrorHandler() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const error = params.get("error");
    const errorCode = params.get("error_code");
    const errorDesc = params.get("error_description");

    if (!error) return;

    // Clear the ugly hash from the URL
    window.history.replaceState(null, "", window.location.pathname);

    if (errorCode === "otp_expired") {
      router.replace("/forgot-password?expired=1");
    } else if (error === "access_denied") {
      router.replace(`/login?error=link-expired`);
    } else if (errorDesc) {
      router.replace(`/login?error=${encodeURIComponent(errorDesc)}`);
    }
  }, [router]);

  return null;
}
