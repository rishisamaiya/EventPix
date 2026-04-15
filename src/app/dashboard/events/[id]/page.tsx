import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share2, ImageIcon, Users, Settings, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "./share-button";
import { EventPhotos } from "./event-photos";
import { EventActions } from "./event-actions";
import { PrivacyModeToggle } from "./privacy-mode-toggle";
import { EventChecklist } from "@/components/event-checklist";
import { EventTabs } from "@/components/event-tabs";

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

  const { count: guestCount } = await supabase
    .from("guest_sessions")
    .select("*", { count: "exact", head: true })
    .eq("event_id", id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shareUrl = `${appUrl}/e/${event.share_slug}`;

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      {/* Event Header */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card">
        {/* Cover image strip */}
        {event.cover_url ? (
          <div className="relative h-40 w-full overflow-hidden">
            <img src={event.cover_url} alt={event.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <Link
              href={`/dashboard/events/${id}/settings`}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/60"
            >
              <Settings className="h-3.5 w-3.5" /> Change cover
            </Link>
          </div>
        ) : (
          <Link
            href={`/dashboard/events/${id}/settings`}
            className="flex h-20 w-full items-center justify-center gap-2 border-b border-border bg-muted/20 text-sm font-medium text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
          >
            <ImageIcon className="h-4 w-4" />
            Add cover photo → go to Settings tab
          </Link>
        )}

        <div className="p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1 className="text-2xl font-bold">{event.name}</h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  event.status === "active"
                    ? "bg-green-100 text-green-700"
                    : event.status === "draft"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {event.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {event.event_date && (
                <span>
                  {new Date(event.event_date).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
              {event.location && (
                <>
                  <span>·</span>
                  <span>{event.location}</span>
                </>
              )}
              {event.event_type && event.event_type !== "other" && (
                <>
                  <span>·</span>
                  <span className="capitalize">{event.event_type}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
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

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: <ImageIcon className="h-4 w-4" />, label: "Photos", value: event.photo_count },
            { icon: <Users className="h-4 w-4" />, label: "Guests", value: guestCount ?? 0 },
            { icon: <Share2 className="h-4 w-4" />, label: "Storage", value: event.storage_type?.replace("_", " ") },
            { icon: <Calendar className="h-4 w-4" />, label: "PIN", value: event.pin_code ? "Protected" : "Open" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                {stat.icon}
                <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="mt-1 text-xl font-bold capitalize">{stat.value}</p>
            </div>
          ))}
        </div>
        </div>{/* end p-6 */}
      </div>

      {/* Tabs */}
      <EventTabs eventId={id} guestCount={guestCount ?? 0} />

      {/* Share Section */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Share with Guests</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-3">
            <code className="text-sm break-all">{shareUrl}</code>
          </div>
          <ShareButton url={shareUrl} />
        </div>
      </div>

      {/* Gallery Privacy */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          Gallery Settings
        </h2>
        <PrivacyModeToggle eventId={event.id} initialPrivacyMode={event.privacy_mode ?? false} />
      </div>

      {/* Photos Section */}
      <EventPhotos
        eventId={event.id}
        initialPhotos={photos ?? []}
        isGoogleConnected={!!event.cloud_config?.access_token}
      />

      {/* Setup Checklist */}
      <EventChecklist
        eventId={event.id}
        hasPhotos={(event.photo_count ?? 0) > 0}
        hasCover={!!event.cover_url}
        isPublished={event.status === "active"}
        hasGuests={(guestCount ?? 0) > 0}
      />
    </div>
  );
}
