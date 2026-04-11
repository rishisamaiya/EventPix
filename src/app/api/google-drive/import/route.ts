import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { eventId, photos } = await request.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("host_id", user.id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const records = photos.map((p: any) => ({
    event_id: eventId,
    source_url: p.source_url,
    thumbnail_url: p.thumbnail_url,
    drive_file_id: p.drive_file_id,
    width: p.width || null,
    height: p.height || null,
    file_size: p.size || null,
    mime_type: p.mime_type,
    faces_indexed: false,
    face_count: 0,
  }));

  const { data, error } = await supabase
    .from("photos")
    .insert(records)
    .select("id, source_url, thumbnail_url, drive_file_id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update photo count
  const { count } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  await supabase
    .from("events")
    .update({ photo_count: count ?? 0 })
    .eq("id", eventId);

  return NextResponse.json({ imported: data?.length ?? 0, photos: data });
}
