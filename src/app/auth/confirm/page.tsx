"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

// This page handles token_hash-based email links (password reset, email confirmation).
// Using a CLIENT component is critical — email scanners (Gmail, Outlook, etc.) follow
// server-rendered redirects but do NOT execute JavaScript, so the token is never
// consumed by a scanner. Only a real user's browser will call verifyOtp().
function ConfirmHandler() {
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next") ?? "/dashboard";

    if (!token_hash || !type) {
      router.replace("/login?error=link-expired");
      return;
    }

    const supabase = createClient();

    supabase.auth
      .verifyOtp({ token_hash, type: type as "recovery" | "email" | "signup" | "invite" | "magiclink" | "email_change" })
      .then(({ error }) => {
        if (error) {
          console.error("verifyOtp error:", error.message);
          router.replace("/login?error=link-expired");
        } else {
          router.replace(next);
        }
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Camera className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Verifying your link…</span>
        </div>
      </div>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense>
      <ConfirmHandler />
    </Suspense>
  );
}
