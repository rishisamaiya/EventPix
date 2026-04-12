import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { indexFacesInPhoto } from "@/lib/rekognition";
import { getDriveClient, refreshAccessToken } from "@/lib/google-drive";

// POST /api/rekognition/index-photo
// Body: { photoId: string, eventId: string }
// Fetches the photo from Google Drive (or Supabase Storage), sends to Rekognition,
// updates the photo record in DB.
export async function POST(request: NextRequest) {
  const { photoId, eventId } = await request.json();

  if (!photoId || !eventId) {
    return NextResponse.json({ error: "Missing photoId or eventId" }, { status: 400 });
  }

  const supabase = await createClient();

  // Verify the caller owns this event
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: photo } = await supabase
    .from("photos")
    .select("id, drive_file_id, source_url, event_id")
    .eq("id", photoId)
    .eq("event_id", eventId)
    .single();

  if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

  try {
    let imageBytes: Uint8Array;

    if (photo.drive_file_id) {
      // Fetch from Google Drive
      const { data: event } = await supabase
        .from("events")
        .select("cloud_config")
        .eq("id", eventId)
        .single();

      if (!event?.cloud_config?.access_token) {
        return NextResponse.json({ error: "Google Drive not connected" }, { status: 400 });
      }

      let accessToken: string = event.cloud_config.access_token;
      const refreshToken: string | undefined = event.cloud_config.refresh_token;

      // Try fetching; auto-refresh token on 401
      async function fetchFromDrive(token: string): Promise<ArrayBuffer | null> {
        try {
          const { drive } = getDriveClient(token, refreshToken);
          // Use large thumbnail (1200px) — plenty for face recognition, much faster than full
          const metaRes = await drive.files.get({
            fileId: photo!.drive_file_id!,
            fields: "thumbnailLink",
          });

          let thumbUrl = metaRes.data.thumbnailLink;
          if (thumbUrl) {
            thumbUrl = thumbUrl.replace(/=s\d+/, "=s1200");
            const imgRes = await fetch(thumbUrl);
            if (imgRes.ok) return imgRes.arrayBuffer();
          }

          // Fallback to full file
          const res = await drive.files.get(
            { fileId: photo!.drive_file_id!, alt: "media" },
            { responseType: "arraybuffer" }
          );
          return res.data as ArrayBuffer;
        } catch (err: any) {
          if (err?.code === 401 || err?.status === 401 || err?.response?.status === 401) {
            return null;
          }
          throw err;
        }
      }

      let buffer = await fetchFromDrive(accessToken);

      if (buffer === null && refreshToken) {
        const newToken = await refreshAccessToken(refreshToken);
        if (newToken) {
          accessToken = newToken;
          await supabase
            .from("events")
            .update({ cloud_config: { ...event.cloud_config, access_token: newToken } })
            .eq("id", eventId);
          buffer = await fetchFromDrive(newToken);
        }
      }

      if (!buffer) {
        return NextResponse.json({ error: "Failed to fetch from Drive — token expired" }, { status: 401 });
      }

      imageBytes = new Uint8Array(buffer);
    } else {
      // Fetch from Supabase Storage or direct URL
      const url = photo.source_url;
      if (!url) return NextResponse.json({ error: "No image URL" }, { status: 400 });

      const fullUrl = url.startsWith("/")
        ? `${process.env.NEXT_PUBLIC_APP_URL}${url}`
        : url;

      const res = await fetch(fullUrl);
      if (!res.ok) return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
      imageBytes = new Uint8Array(await res.arrayBuffer());
    }

    // Send to Rekognition
    const faceCount = await indexFacesInPhoto(eventId, photoId, imageBytes);

    // Update DB
    await supabase
      .from("photos")
      .update({ faces_indexed: true, face_count: faceCount })
      .eq("id", photoId);

    return NextResponse.json({ success: true, faceCount });
  } catch (err: any) {
    console.error("Rekognition index error:", err);
    // Mark as indexed even on failure so we don't retry infinitely
    await supabase
      .from("photos")
      .update({ faces_indexed: true, face_count: 0 })
      .eq("id", photoId);
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 500 });
  }
}
