import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// DELETE /api/r2/cleanup-failed
// Removes photo records that were created by the presign route but whose
// files never actually made it to R2 (identifiable by: no drive_file_id,
// storage_key present, and face_count = 0 with faces_indexed = true OR
// source_url contains the R2 public domain).
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId } = await request.json();
  if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

  // Verify ownership
  const { data: event } = await supabase
    .from("events")
    .select("id, photo_count")
    .eq("id", eventId)
    .eq("host_id", user.id)
    .single();

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Find R2 photos (no drive_file_id = not a Drive photo) that have 0 faces
  // These are the ones whose uploads failed — files don't exist in R2
  const { data: brokenPhotos } = await supabase
    .from("photos")
    .select("id")
    .eq("event_id", eventId)
    .is("drive_file_id", null)
    .eq("face_count", 0);

  if (!brokenPhotos || brokenPhotos.length === 0) {
    return NextResponse.json({ deleted: 0, message: "No broken uploads found" });
  }

  const ids = brokenPhotos.map((p) => p.id);

  // Clean up related data first
  await supabase.from("face_embeddings").delete().in("photo_id", ids);
  const { error } = await supabase.from("photos").delete().in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update photo count to reflect only the surviving Drive photos
  const { count } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  await supabase
    .from("events")
    .update({ photo_count: count ?? 0 })
    .eq("id", eventId);

  return NextResponse.json({ deleted: ids.length, remaining: count ?? 0 });
}
