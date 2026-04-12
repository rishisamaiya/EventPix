import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteCollection } from "@/lib/rekognition";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2";

const BUCKET = process.env.R2_BUCKET_NAME!;

async function deleteAllR2ForEvent(eventId: string) {
  const prefix = `events/${eventId}/`;
  let token: string | undefined;
  do {
    const list = await r2Client.send(new ListObjectsV2Command({
      Bucket: BUCKET, Prefix: prefix, ContinuationToken: token,
    }));
    const objects = list.Contents ?? [];
    if (objects.length > 0) {
      await r2Client.send(new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: objects.map((o) => ({ Key: o.Key! })) },
      }));
    }
    token = list.NextContinuationToken;
  } while (token);
}

// Vercel Cron: runs daily at midnight
// Cleans up events that expired > 7 days ago (grace period)
export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron (not a public user)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Find events past their expiry with a 7-day grace period
  const { data: expiredEvents } = await supabase
    .from("events")
    .select("id, name, host_id")
    .eq("status", "expired")
    .lt("expires_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (!expiredEvents || expiredEvents.length === 0) {
    return NextResponse.json({ cleaned: 0, message: "No expired events to clean up" });
  }

  const results = [];
  for (const event of expiredEvents) {
    try {
      await deleteAllR2ForEvent(event.id);
      await deleteCollection(event.id);
      await supabase.from("face_embeddings").delete().eq("event_id", event.id);
      await supabase.from("photos").delete().eq("event_id", event.id);
      await supabase.from("events").update({ status: "deleted" }).eq("id", event.id);
      results.push({ id: event.id, name: event.name, status: "cleaned" });
    } catch (err: any) {
      results.push({ id: event.id, name: event.name, status: "error", error: err.message });
    }
  }

  return NextResponse.json({ cleaned: results.length, results });
}
