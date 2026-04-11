import { NextRequest, NextResponse } from "next/server";
import {
  listPhotosInFolder,
  getDriveThumbnailUrl,
  getDriveImageProxyUrl,
} from "@/lib/google-drive";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { eventId, folderId, pageToken } = await request.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: event } = await supabase
    .from("events")
    .select("cloud_config")
    .eq("id", eventId)
    .eq("host_id", user.id)
    .single();

  if (!event?.cloud_config?.access_token) {
    return NextResponse.json(
      { error: "Google Drive not connected" },
      { status: 400 }
    );
  }

  try {
    const result = await listPhotosInFolder(
      event.cloud_config.access_token,
      folderId,
      pageToken
    );

    const photos = result.files.map((file) => ({
      drive_file_id: file.id,
      name: file.name,
      mime_type: file.mimeType,
      size: file.size ? parseInt(file.size) : 0,
      width: file.imageMediaMetadata?.width,
      height: file.imageMediaMetadata?.height,
      thumbnail_url: getDriveThumbnailUrl(file.id!, 400),
      source_url: getDriveImageProxyUrl(file.id!),
    }));

    return NextResponse.json({
      photos,
      nextPageToken: result.nextPageToken,
    });
  } catch (error: any) {
    console.error("Drive photos error:", error);
    return NextResponse.json(
      { error: "Failed to list photos" },
      { status: 500 }
    );
  }
}
