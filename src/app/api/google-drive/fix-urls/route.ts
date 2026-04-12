import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { eventId } = await request.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: photos } = await supabase
    .from("photos")
    .select("id, drive_file_id")
    .eq("event_id", eventId)
    .not("drive_file_id", "is", null);

  if (!photos || photos.length === 0) {
    return NextResponse.json({ fixed: 0 });
  }

  let fixed = 0;
  for (const photo of photos) {
    const { error } = await supabase
      .from("photos")
      .update({
        thumbnail_url: `/api/drive-image/${photo.id}?size=thumb`,
        source_url: `/api/drive-image/${photo.id}?size=full`,
      })
      .eq("id", photo.id);

    if (!error) fixed++;
  }

  return NextResponse.json({ fixed });
}
