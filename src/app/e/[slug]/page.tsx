import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuestGallery } from "./guest-gallery";

export default async function EventGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("share_slug", slug)
    .eq("status", "active")
    .single();

  if (!event) notFound();

  const isExpired = event.status === "expired" || (event.expires_at && new Date(event.expires_at).getTime() < Date.now());

  if (isExpired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Event Expired</h1>
          <p className="mb-6 text-gray-500">
            The hosting period for this event has ended. The gallery is no longer accessible. Please contact the host.
          </p>
          <a
            href="/"
            className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Powered by EventPix
          </a>
        </div>
      </div>
    );
  }

  const { data: photos } = await supabase
    .from("photos")
    .select("id, source_url, thumbnail_url, face_count")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  return (
    <GuestGallery
      event={event}
      photos={photos ?? []}
    />
  );
}
