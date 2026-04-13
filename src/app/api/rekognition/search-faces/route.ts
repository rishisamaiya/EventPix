import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchFacesByImage } from "@/lib/rekognition";
import crypto from "crypto";

// In-memory cache: { cacheKey -> { photos, expiresAt } }
// Prevents re-billing when a guest re-submits the same selfie within 10 minutes.
const _searchCache = new Map<string, { photos: unknown[]; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// POST /api/rekognition/search-faces
// Body: { imageData: string (base64 data URL), eventId: string, threshold?: number }
// Returns matching photos from this event.
export async function POST(request: NextRequest) {
  const { imageData, eventId, threshold = 80 } = await request.json();

  if (!imageData || !eventId) {
    return NextResponse.json({ error: "Missing imageData or eventId" }, { status: 400 });
  }

  // Convert base64 data URL to raw bytes
  // imageData is like: "data:image/jpeg;base64,/9j/4AAQ..."
  const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");
  const imageBytes = new Uint8Array(buffer);

  // Cache key = hash of image bytes + eventId — same selfie = same key
  const cacheKey = crypto
    .createHash("sha256")
    .update(buffer)
    .update(eventId)
    .digest("hex");

  const cached = _searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ photos: cached.photos, cached: true });
  }

  try {
    const matches = await searchFacesByImage(eventId, imageBytes, threshold);

    if (matches.length === 0) {
      return NextResponse.json({ photos: [] });
    }

    // Fetch full photo details from DB for the matched photo IDs
    const supabase = await createClient();
    const photoIds = matches.map((m) => m.photoId);

    const { data: photos } = await supabase
      .from("photos")
      .select("id, source_url, thumbnail_url, face_count")
      .in("id", photoIds)
      .eq("event_id", eventId);

    if (!photos) return NextResponse.json({ photos: [] });

    // Merge similarity scores and preserve sort order (best match first)
    const similarityMap = new Map(matches.map((m) => [m.photoId, m.similarity]));
    const result = photos
      .map((p) => ({ ...p, similarity: similarityMap.get(p.id) ?? 0 }))
      .sort((a, b) => b.similarity - a.similarity);

    // Cache result to avoid re-billing on repeat submits
    _searchCache.set(cacheKey, { photos: result, expiresAt: Date.now() + CACHE_TTL_MS });

    return NextResponse.json({ photos: result });
  } catch (err: any) {
    console.error("Rekognition search error:", err);
    return NextResponse.json({ error: err.message ?? "Search failed" }, { status: 500 });
  }
}
