import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteFromR2 } from "@/lib/r2";
import { deleteCollection } from "@/lib/rekognition";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2";

const BUCKET = process.env.R2_BUCKET_NAME!;

async function deleteAllR2ObjectsForEvent(eventId: string) {
  const prefix = `events/${eventId}/`;
  let continuationToken: string | undefined;

  do {
    const list = await r2Client.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));

    const objects = list.Contents ?? [];
    if (objects.length > 0) {
      await r2Client.send(new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: objects.map((o) => ({ Key: o.Key! })) },
      }));
    }

    continuationToken = list.NextContinuationToken;
  } while (continuationToken);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId } = await request.json();
  if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

  // Verify ownership
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("host_id", user.id)
    .single();

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // 1. Delete all R2 objects for this event
  try {
    await deleteAllR2ObjectsForEvent(eventId);
  } catch (err) {
    console.warn("R2 bulk delete warning:", err);
  }

  // 2. Delete Rekognition collection
  try {
    await deleteCollection(eventId);
  } catch (err) {
    console.warn("Rekognition collection delete warning:", err);
  }

  // 3. Delete DB records (cascade order)
  await supabase.from("face_embeddings").delete().eq("event_id", eventId);
  await supabase.from("photos").delete().eq("event_id", eventId);
  await supabase.from("guest_sessions").delete().eq("event_id", eventId);
  await supabase.from("events").delete().eq("id", eventId);

  return NextResponse.json({ success: true });
}
