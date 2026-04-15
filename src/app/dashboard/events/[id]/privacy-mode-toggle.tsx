"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function PrivacyModeToggle({
  eventId,
  initialPrivacyMode,
}: {
  eventId: string;
  initialPrivacyMode: boolean;
}) {
  const [privacyMode, setPrivacyMode] = useState(initialPrivacyMode);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !privacyMode;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("events")
      .update({ privacy_mode: next })
      .eq("id", eventId);
    setPrivacyMode(next);
    setSaving(false);
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg ${privacyMode ? "bg-amber-100" : "bg-muted"}`}>
          {privacyMode
            ? <EyeOff className="h-5 w-5 text-amber-600" />
            : <Eye className="h-5 w-5 text-muted-foreground" />
          }
        </div>
        <div>
          <p className="font-semibold text-sm">
            {privacyMode ? "Privacy Mode: ON" : "Privacy Mode: OFF"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
            {privacyMode
              ? "Guests see a blurred gallery. They must take a selfie to reveal their matched photos. Great for surprise reveals!"
              : "All photos are visible to guests. Taking a selfie filters to their personal matches in the \"My Photos\" tab."
            }
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={saving}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          privacyMode ? "bg-amber-500" : "bg-slate-200"
        } disabled:opacity-60`}
        role="switch"
        aria-checked={privacyMode}
      >
        {saving ? (
          <Loader2 className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
        ) : (
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
              privacyMode ? "translate-x-5" : "translate-x-0"
            }`}
          />
        )}
      </button>
    </div>
  );
}
