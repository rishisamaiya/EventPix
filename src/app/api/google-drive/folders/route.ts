import { NextRequest, NextResponse } from "next/server";
import { listFolders } from "@/lib/google-drive";
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
    const folders = await listFolders(event.cloud_config.access_token);
    return NextResponse.json({ folders });
  } catch (error: any) {
    if (error?.code === 401) {
      return NextResponse.json(
        { error: "Token expired, reconnect Google Drive" },
        { status: 401 }
      );
    }
    return NextResponse.json({ error: "Failed to list folders" }, { status: 500 });
  }
}
