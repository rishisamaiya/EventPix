"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RefreshCw, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function EventActions({
  eventId,
  hasdrivePhotos,
}: {
  eventId: string;
  hasdrivePhotos: boolean;
}) {
  const [deleting, setDeleting] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this event? All photos and data will be lost.")) {
      return;
    }

    setDeleting(true);
    await supabase.from("face_embeddings").delete().eq("event_id", eventId);
    await supabase.from("photos").delete().eq("event_id", eventId);
    await supabase.from("guest_sessions").delete().eq("event_id", eventId);
    await supabase.from("events").delete().eq("id", eventId);

    router.push("/dashboard");
    router.refresh();
  }

  async function handleFixDriveUrls() {
    setFixing(true);
    setFixResult(null);
    try {
      const res = await fetch("/api/google-drive/fix-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      setFixResult(`Fixed ${data.fixed} photos`);
      router.refresh();
    } catch {
      setFixResult("Failed to fix photos");
    }
    setFixing(false);
  }

  return (
    <div className="flex items-center gap-2">
      {hasdrivePhotos && (
        <button
          onClick={handleFixDriveUrls}
          disabled={fixing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
        >
          {fixing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {fixing ? "Fixing..." : fixResult || "Fix Drive Photos"}
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
      >
        {deleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
        {deleting ? "Deleting..." : "Delete Event"}
      </button>
    </div>
  );
}
