import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  QrCode,
  ImageIcon,
  Users,
  ExternalLink,
  Copy,
  Settings,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "./share-button";

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
    .order("created_at", { ascending: false })
    .limit(20);

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
      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
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
            <p className="text-sm text-muted-foreground">
              {event.event_date
                ? new Date(event.event_date).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "No date set"}
            </p>
          </div>

          <div className="flex gap-2">
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
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Photos
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold">{event.photo_count}</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Guests
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold">{event.guest_count}</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Share2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Storage
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold capitalize">
              {event.storage_type?.replace("_", " ")}
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Settings className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                PIN
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold">
              {event.pin_code ? "Protected" : "Open"}
            </p>
          </div>
        </div>
      </div>

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

      {/* Photos Section */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Photos</h2>
          <span className="text-sm text-muted-foreground">
            Connect Google Drive to add photos
          </span>
        </div>

        {!photos || photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <ImageIcon className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mb-1 font-semibold">No photos yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Connect your Google Drive to import event photos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <img
                  src={photo.thumbnail_url || photo.source_url}
                  alt=""
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                {photo.faces_indexed && (
                  <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    {photo.face_count} faces
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
