import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/debug-faces?eventId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ error: "Missing eventId param" }, { status: 400 });
  }

  const supabase = await createClient();

  const { count } = await supabase
    .from("face_embeddings")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  const { data: sample } = await supabase
    .from("face_embeddings")
    .select("id, photo_id, embedding")
    .eq("event_id", eventId)
    .limit(1);

  let embeddingInfo: any = null;
  if (sample && sample[0]) {
    const emb = sample[0].embedding;
    const parsed = typeof emb === "string" ? JSON.parse(emb) : emb;
    const arr = Array.isArray(parsed) ? parsed : Object.values(parsed);
    embeddingInfo = {
      storage_type: typeof emb,
      is_array: Array.isArray(parsed),
      dimension: arr.length,
      first_5_values: arr.slice(0, 5).map((v: any) => parseFloat(v).toFixed(6)),
      value_range: {
        min: Math.min(...arr).toFixed(4),
        max: Math.max(...arr).toFixed(4),
        avg: (arr.reduce((s: number, v: number) => s + v, 0) / arr.length).toFixed(4),
      },
    };
  }

  // Check if match_faces function uses euclidean (new) or cosine (old)
  // Run it with a zero vector - old cosine would return nothing, new euclidean returns by distance
  const zeroVec = "[" + Array(128).fill(0).join(",") + "]";
  const { data: fnTest, error: fnError } = await supabase.rpc("match_faces", {
    query_embedding: sample?.[0]?.embedding ?? zeroVec,
    target_event_id: eventId,
    similarity_threshold: 9999,
    max_results: 3,
  });

  // Compute pairwise distances between first 5 embeddings
  const { data: allEmbs } = await supabase
    .from("face_embeddings")
    .select("id, photo_id, embedding")
    .eq("event_id", eventId)
    .limit(5);

  let distanceSamples: any[] = [];
  if (allEmbs && allEmbs.length >= 2) {
    const toArr = (e: any) => {
      const p = typeof e === "string" ? JSON.parse(e) : e;
      return Array.isArray(p) ? p : Object.values(p);
    };
    const emb0 = toArr(allEmbs[0].embedding);
    distanceSamples = allEmbs.slice(1).map((row: any) => {
      const emb = toArr(row.embedding);
      const euclidean = Math.sqrt(
        emb0.reduce((sum: number, v: number, i: number) => sum + Math.pow(v - emb[i], 2), 0)
      );
      const dot = emb0.reduce((s: number, v: number, i: number) => s + v * emb[i], 0);
      const mag0 = Math.sqrt(emb0.reduce((s: number, v: number) => s + v * v, 0));
      const mag1 = Math.sqrt(emb.reduce((s: number, v: number) => s + v * v, 0));
      const cosine = dot / (mag0 * mag1);
      return {
        photo_id: row.photo_id,
        euclidean: euclidean.toFixed(4),
        cosine_similarity: cosine.toFixed(4),
        verdict: euclidean < 0.6 ? "SAME PERSON (euclidean)" : "DIFFERENT (euclidean)",
      };
    });
  }

  // Which function signature is active?
  const { data: fnDef } = await supabase
    .from("pg_proc")
    .select("prosrc")
    .limit(1);

  return NextResponse.json({
    event_id: eventId,
    total_embeddings: count,
    embedding_format: embeddingInfo,
    match_fn_with_huge_threshold: {
      returned_count: fnTest?.length ?? 0,
      error: fnError?.message ?? null,
      first_result_distance: fnTest?.[0]?.similarity ?? null,
      note: "If distance values are < 1.5 → Euclidean (fixed). If values are 0-1 and high → still Cosine (not fixed)",
    },
    pairwise_distances_first_5_embeddings: distanceSamples,
  });
}
