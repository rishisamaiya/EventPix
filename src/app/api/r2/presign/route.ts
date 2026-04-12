import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPresignedUploadUrl, getPublicUrl, buildPhotoKey } from "@/lib/r2";

// POST /api/r2/presign
// Body: { eventId, filename, contentType, fileSize }
// Returns: { uploadUrl, publicUrl, photoId, key }
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId, filename, contentType, fileSize } = await request.json();

  if (!eventId || !filename || !contentType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Guard: verify all R2 env vars are present before attempting
  const missingVars = ["R2_ACCOUNT_ID","R2_ACCESS_KEY_ID","R2_SECRET_ACCESS_KEY","R2_BUCKET_NAME"]
    .filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    return NextResponse.json(
      { error: `R2 not configured — missing Vercel env vars: ${missingVars.join(", ")}` },
      { status: 500 }
    );
  }

  // Verify user owns the event
  const { data: event } = await supabase
    .from("events")
    .select("id, photo_count")
    .eq("id", eventId)
    .eq("host_id", user.id)
    .single();

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Insert photo record — DB generates the UUID
  const { data: photo, error: insertErr } = await supabase
    .from("photos")
    .insert({
      event_id: eventId,
      source_url: "pending",
      thumbnail_url: "pending",
      mime_type: contentType,
      file_size: fileSize || null,
      faces_indexed: false,
      face_count: 0,
    })
    .select("id")
    .single();

  if (insertErr || !photo) {
    return NextResponse.json({ error: insertErr?.message ?? "Insert failed" }, { status: 500 });
  }

  const photoId = photo.id;
  const key = buildPhotoKey(eventId, photoId, filename);
  const publicUrl = getPublicUrl(key);

  // Update photo with real URLs. Try with storage_key first; if that column
  // doesn't exist yet fall back to updating just the URLs so uploads still work.
  const { error: updateErr } = await supabase
    .from("photos")
    .update({ source_url: publicUrl, thumbnail_url: publicUrl, storage_key: key })
    .eq("id", photoId);

  if (updateErr) {
    // storage_key column may not exist — retry without it
    const { error: fallbackErr } = await supabase
      .from("photos")
      .update({ source_url: publicUrl, thumbnail_url: publicUrl })
      .eq("id", photoId);
    if (fallbackErr) {
      console.error("presign: failed to update photo URL", fallbackErr.message);
      return NextResponse.json({ error: `Failed to save photo URL: ${fallbackErr.message}` }, { status: 500 });
    }
  }

  // Increment event photo count
  await supabase
    .from("events")
    .update({ photo_count: (event.photo_count || 0) + 1 })
    .eq("id", eventId);

  // Generate presigned upload URL (valid for 5 minutes)
  const uploadUrl = await getPresignedUploadUrl(key, contentType, 300);

  return NextResponse.json({ uploadUrl, publicUrl, photoId, key });
}
