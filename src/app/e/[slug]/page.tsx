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
