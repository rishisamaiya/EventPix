import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EventActions } from "./event-actions";
import { EventChecklist } from "@/components/event-checklist";
import { EventDetailClient } from "./event-detail-client";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("host_id", user.id)
    .single();

  if (!event) notFound();

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const { data: sessions } = await supabase
    .from("guest_sessions")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shareUrl = `${appUrl}/e/${event.share_slug}`;

  const guestCount = sessions?.length ?? 0;

  // Expiry calculation
  const expiresAt = event.expires_at ? new Date(event.expires_at) : null;
  const now = new Date();
  
  let daysUntilExpiry = null;
  let isExpired = false;
  let graceDaysLeft = null;
  
  if (expiresAt) {
    const diffMs = expiresAt.getTime() - now.getTime();
    daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 0) {
      isExpired = true;
      // 7 days grace period from expiry date
      const graceEnd = new Date(expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      graceDaysLeft = Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  return (
    <div>
      {/* Back + Publish row */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
        <div className="flex items-center gap-2">
          {event.status === "draft" && (
            <form
              action={async () => {
                "use server";
                const supabase = await createClient();
                await supabase
                  .from("events")
                  .update({ status: "active" })
                  .eq("id", id);
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Publish Event
              </button>
            </form>
          )}
          <EventActions eventId={event.id} hasdrivePhotos={!!event.cloud_config?.access_token} />
        </div>
      </div>

      {/* Expiry Banner */}
      {isExpired ? (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-bold text-red-900">Event Expired (Gallery Locked)</h3>
              <p className="text-sm text-red-700">
                This event has expired and the gallery is no longer accessible to guests. All cloud data (including photos) will be permanently deleted in <strong>{Math.max(0, graceDaysLeft ?? 0)} days</strong>.
              </p>
            </div>
          </div>
        </div>
      ) : daysUntilExpiry !== null && daysUntilExpiry <= 7 ? (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-bold text-yellow-900">Event Expiring Soon</h3>
              <p className="text-sm text-yellow-800">
                This event will expire in <strong>{daysUntilExpiry} days</strong>. Once expired, the gallery will be locked and queued for data deletion to clear cloud storage.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Sidebar + tabs layout */}
      <EventDetailClient
        event={event}
        photos={photos ?? []}
        sessions={sessions ?? []}
        shareUrl={shareUrl}
      />

      {/* Setup Checklist (floating) */}
      <EventChecklist
        eventId={event.id}
        hasPhotos={(event.photo_count ?? 0) > 0}
        hasCover={!!event.cover_url}
        isPublished={event.status === "active"}
        hasGuests={guestCount > 0}
      />
    </div>
  );
}
