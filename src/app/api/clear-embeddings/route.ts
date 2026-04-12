import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/clear-embeddings  { eventId }
// Deletes all face embeddings and resets faces_indexed for an event
export async function POST(request: NextRequest) {
  const { eventId } = await request.json();
  if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

  const supabase = await createClient();

  // Verify the user owns this event
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("host_id", user.id)
    .single();

  if (!event) return NextResponse.json({ error: "Event not found or not yours" }, { status: 403 });

  // Delete all embeddings for this event
  const { error: delErr } = await supabase
    .from("face_embeddings")
    .delete()
    .eq("event_id", eventId);

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  // Reset faces_indexed on all photos so they get re-indexed
  const { error: resetErr } = await supabase
    .from("photos")
    .update({ faces_indexed: false, face_count: 0 })
    .eq("event_id", eventId);

  if (resetErr) return NextResponse.json({ error: resetErr.message }, { status: 500 });

  return NextResponse.json({ success: true, message: "Embeddings cleared. Re-run face indexing." });
}
