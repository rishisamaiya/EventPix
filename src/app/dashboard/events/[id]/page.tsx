import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
