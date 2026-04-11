import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { embedding, eventId, threshold = 0.6, limit = 100 } = await request.json();

    if (!embedding || !eventId) {
      return NextResponse.json(
        { error: "Missing embedding or eventId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const formattedEmbedding = `[${embedding.join(",")}]`;

    const { data, error } = await supabase.rpc("match_faces", {
      query_embedding: formattedEmbedding,
      target_event_id: eventId,
      similarity_threshold: threshold,
      max_results: limit,
    });

    if (error) {
      console.error("Face match error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ matches: data ?? [] });
  } catch (err) {
    console.error("Match faces API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
