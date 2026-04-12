import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteFromR2 } from "@/lib/r2";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { photoId } = await request.json();
  if (!photoId) return NextResponse.json({ error: "Missing photoId" }, { status: 400 });

  // Verify ownership + get storage key
  const { data: photo } = await supabase
    .from("photos")
    .select("id, storage_key, event_id, events!inner(host_id)")
    .eq("id", photoId)
    .single();

  if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

  // Delete from R2 if it was an R2 upload
  if (photo.storage_key) {
    try {
      await deleteFromR2(photo.storage_key);
    } catch (err) {
      console.warn("R2 delete warning (file may already be gone):", err);
    }
  }

  // Delete DB records
  await supabase.from("face_embeddings").delete().eq("photo_id", photoId);
  await supabase.from("photos").delete().eq("id", photoId);

  return NextResponse.json({ success: true });
}
