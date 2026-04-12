import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDriveClient, refreshAccessToken } from "@/lib/google-drive";

// size=thumb  → 400px thumbnail (grid)
// size=large  → 1200px thumbnail (lightbox)
// size=full   → original file download

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

  const fileId = photo.drive_file_id;

  const { data: event } = await supabase
    .from("events")
    .select("id, cloud_config")
    .eq("id", photo.event_id)
    .single();

  if (!event?.cloud_config?.access_token) {
    return new NextResponse("Drive not connected", { status: 400 });
  }

  let accessToken: string = event.cloud_config.access_token;
  const refreshToken: string | undefined = event.cloud_config.refresh_token;

  // Helper: try fetching, auto-refresh token on 401
  async function fetchDriveImage(token: string): Promise<Response | null> {
    try {
      const { drive } = getDriveClient(token, refreshToken);

      if (size === "full") {
        // Download the original file
        const res = await drive.files.get(
          { fileId, alt: "media" },
          { responseType: "arraybuffer" }
        );
        return new NextResponse(res.data as ArrayBuffer, {
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=86400",
            "Content-Disposition": `attachment; filename="photo.jpg"`,
          },
        }) as unknown as Response;
      }

      // For thumb and large: use Google's thumbnail URL (much faster, no quota)
      const pixelSize = size === "large" ? 1200 : 400;
      const metaRes = await drive.files.get({
        fileId,
        fields: "thumbnailLink,hasThumbnail",
      });

      let thumbUrl = metaRes.data.thumbnailLink;
      if (thumbUrl) {
        thumbUrl = thumbUrl.replace(/=s\d+/, `=s${pixelSize}`);
        const imgRes = await fetch(thumbUrl);
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": imgRes.headers.get("content-type") || "image/jpeg",
              "Cache-Control": "public, max-age=86400",
            },
          }) as unknown as Response;
        }
      }

      // Thumbnail not ready yet (Google Drive still processing new uploads).
      // Stream the file directly but cap at 1 MB to avoid Vercel timeouts.
      const res = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );
      const buf = res.data as ArrayBuffer;
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "image/jpeg",
          // Short cache so the real thumbnail will replace it once Drive processes the file
          "Cache-Control": "public, max-age=60",
        },
      }) as unknown as Response;
    } catch (err: any) {
      if (err?.code === 401 || err?.status === 401 || err?.response?.status === 401) {
        return null; // signal to refresh
      }
      throw err;
    }
  }

  try {
    let result = await fetchDriveImage(accessToken);

    // Token expired — refresh and retry
    if (result === null && refreshToken) {
      const newToken = await refreshAccessToken(refreshToken);
      if (newToken) {
        accessToken = newToken;

        // Persist the new token so future requests don't need to refresh
        await supabase
          .from("events")
          .update({
            cloud_config: {
              ...event.cloud_config,
              access_token: newToken,
            },
          })
          .eq("id", event.id);

        result = await fetchDriveImage(newToken);
      }
    }

    if (!result) {
      return new NextResponse("Google Drive token expired. Please reconnect Google Drive in the dashboard.", { status: 401 });
    }

    return result as unknown as NextResponse;
  } catch (error) {
    console.error("Drive image proxy error:", error);
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}
