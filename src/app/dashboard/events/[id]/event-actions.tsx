"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RefreshCw, Loader2, HardDrive } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function EventActions({
  eventId,
  hasdrivePhotos,
}: {
  eventId: string;
  hasdrivePhotos: boolean;
}) {
  const [deleting, setDeleting] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm("Are you sure? This deletes all photos from Cloudflare R2, AWS Rekognition, and the database permanently.")) {
      return;
    }
    setDeleting(true);
    try {
      await fetch("/api/events/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
    } catch (err) {
      console.error("Event delete error:", err);
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleReconnectDrive() {
    setReconnecting(true);
    try {
      const res = await fetch("/api/google-drive/auth-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to get Google auth URL");
        setReconnecting(false);
      }
    } catch {
      alert("Failed to reconnect Google Drive. Check your Google OAuth config.");
      setReconnecting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {hasdrivePhotos && (
        <button
          onClick={handleReconnectDrive}
          disabled={reconnecting}
          title="Photos showing blank? Click to refresh Google Drive connection"
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
        >
          {reconnecting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <HardDrive className="h-3.5 w-3.5" />
          )}
          {reconnecting ? "Connecting..." : "Reconnect Drive"}
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
