import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDriveClient } from "@/lib/google-drive";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  const { photoId } = await params;
  const { searchParams } = new URL(request.url);
  const size = searchParams.get("size") || "thumb";

  const supabase = await createClient();

  const { data: photo } = await supabase
    .from("photos")
    .select("drive_file_id, event_id")
    .eq("id", photoId)
    .single();

  if (!photo?.drive_file_id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { data: event } = await supabase
    .from("events")
    .select("cloud_config, status")
    .eq("id", photo.event_id)
    .single();

  if (!event?.cloud_config?.access_token) {
    return new NextResponse("Drive not connected", { status: 400 });
  }

  try {
    const drive = getDriveClient(event.cloud_config.access_token);

    if (size === "thumb") {
      const res = await drive.files.get(
        { fileId: photo.drive_file_id, fields: "thumbnailLink" },
      );

      if (res.data.thumbnailLink) {
        const thumbUrl = res.data.thumbnailLink.replace(/=s\d+/, "=s400");
        const imgRes = await fetch(thumbUrl);
        const buffer = await imgRes.arrayBuffer();
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": imgRes.headers.get("content-type") || "image/jpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
    }

    const res = await drive.files.get(
      { fileId: photo.drive_file_id, alt: "media" },
      { responseType: "arraybuffer" }
    );

    return new NextResponse(res.data as ArrayBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Drive image proxy error:", error);
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}
