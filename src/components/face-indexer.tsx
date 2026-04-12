"use client";

import { useState, useCallback } from "react";
import { ScanFace, Loader2, CheckCircle2, AlertCircle, Play, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FaceIndexerProps {
  eventId: string;
  unindexedCount: number;
  onComplete: () => void;
}

// Minimum face size as fraction of image dimension — filters tiny background faces
const MIN_FACE_FRACTION = 0.08; // face must be at least 8% of image width or height
// Minimum face pixel size — skip faces smaller than this
const MIN_FACE_PX = 80;
// Detection confidence threshold
const MIN_CONFIDENCE = 0.7;

export function FaceIndexer({ eventId, unindexedCount, onComplete }: FaceIndexerProps) {
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 0, faces: 0, skipped: 0 });
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const supabase = createClient();

  const clearAndReindex = useCallback(async () => {
    setClearing(true);
    try {
      const res = await fetch("/api/clear-embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setDone(false);
      setProgress({ current: 0, total: 0, faces: 0, skipped: 0 });
      setErrors(0);
      setFatalError(null);
      setStatusText("Cleared old embeddings. Ready to re-index.");
      onComplete(); // refresh parent to show unindexed count
    } catch (err) {
      setFatalError(`Clear failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setClearing(false);
    }
  }, [eventId, onComplete]);

  const indexFaces = useCallback(async () => {
    setProcessing(true);
    setDone(false);
    setErrors(0);
    setFatalError(null);

    try {
      setStatusText("Loading AI face detection models (~12MB)...");

      const { loadModels, descriptorToArray } = await import("@/lib/face-detection");
      const faceapi = await import("@vladmandic/face-api");

      await loadModels();
      setStatusText("AI models loaded. Fetching photo list...");

      const { data: photos, error: queryError } = await supabase
        .from("photos")
        .select("id, thumbnail_url, source_url")
        .eq("event_id", eventId)
        .eq("faces_indexed", false)
        .order("created_at", { ascending: true });

      if (queryError) {
        setFatalError(`Database error: ${queryError.message}`);
        setProcessing(false);
        return;
      }

      if (!photos || photos.length === 0) {
        setStatusText("All photos already indexed!");
        setProcessing(false);
        setDone(true);
        return;
      }

      setStatusText(`Processing ${photos.length} photos...`);
      setProgress({ current: 0, total: photos.length, faces: 0, skipped: 0 });
      let totalFaces = 0;
      let totalSkipped = 0;
      let errorCount = 0;

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        setProgress((p) => ({ ...p, current: i + 1 }));
        setStatusText(`Photo ${i + 1}/${photos.length}: loading image...`);

        try {
          const imgUrl = photo.source_url || photo.thumbnail_url;
          if (!imgUrl) {
            errorCount++;
            setErrors(errorCount);
            continue;
          }

          const img = new Image();
          img.crossOrigin = "anonymous";

          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Timeout loading image")), 30000);
            img.onload = () => { clearTimeout(timeout); resolve(); };
            img.onerror = () => { clearTimeout(timeout); reject(new Error("Failed to load")); };
            const fullUrl = imgUrl.startsWith("/")
              ? `${window.location.origin}${imgUrl}`
              : imgUrl;
            img.src = fullUrl;
          });

          setStatusText(`Photo ${i + 1}/${photos.length}: detecting faces...`);

          // Detect all faces with higher confidence threshold
          const detections = await faceapi
            .detectAllFaces(
              img,
              new faceapi.SsdMobilenetv1Options({ minConfidence: MIN_CONFIDENCE })
            )
            .withFaceLandmarks()
            .withFaceDescriptors();

          // Filter: only keep faces that are large enough to be reliable
          const qualityDetections = detections.filter((d) => {
            const box = d.detection.box;
            const faceFractionW = box.width / img.width;
            const faceFractionH = box.height / img.height;
            const isBigEnough =
              box.width >= MIN_FACE_PX &&
              box.height >= MIN_FACE_PX &&
              (faceFractionW >= MIN_FACE_FRACTION || faceFractionH >= MIN_FACE_FRACTION);
            return isBigEnough;
          });

          const skippedInPhoto = detections.length - qualityDetections.length;
          totalSkipped += skippedInPhoto;
          const faceCount = qualityDetections.length;
          totalFaces += faceCount;

          if (faceCount > 0) {
            const embeddings = qualityDetections.map((d) => ({
              photo_id: photo.id,
              event_id: eventId,
              embedding: `[${descriptorToArray(d.descriptor).join(",")}]`,
              bbox_x: d.detection.box.x / img.width,
              bbox_y: d.detection.box.y / img.height,
              bbox_w: d.detection.box.width / img.width,
              bbox_h: d.detection.box.height / img.height,
            }));

            const { error: embedError } = await supabase
              .from("face_embeddings")
              .insert(embeddings);

            if (embedError) {
              console.error("Embedding insert error:", embedError);
            }
          }

          await supabase
            .from("photos")
            .update({ faces_indexed: true, face_count: faceCount })
            .eq("id", photo.id);

          setProgress((p) => ({ ...p, faces: totalFaces, skipped: totalSkipped }));
        } catch (err) {
          console.error(`Failed to index photo ${photo.id}:`, err);
          errorCount++;
          setErrors(errorCount);

          await supabase
            .from("photos")
            .update({ faces_indexed: true, face_count: 0 })
            .eq("id", photo.id);
        }
      }

      setStatusText("Done!");
      setProcessing(false);
      setDone(true);
      onComplete();
    } catch (err) {
      console.error("Face indexing fatal error:", err);
      setFatalError(
        `Failed: ${err instanceof Error ? err.message : "Unknown error"}. Check browser console.`
      );
      setProcessing(false);
    }
  }, [eventId, supabase, onComplete]);

  const progressPercent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  if (unindexedCount === 0 && !done && !fatalError) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      {fatalError ? (
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800">{fatalError}</p>
            <button
              onClick={indexFaces}
              className="mt-2 text-sm font-medium text-red-600 underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : done ? (
        <div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Indexing complete! {progress.faces} quality faces stored
                {progress.skipped > 0 && ` (${progress.skipped} tiny/blurry faces skipped)`} across{" "}
                {progress.total || unindexedCount} photos.
              </p>
              {errors > 0 && (
                <p className="text-xs text-amber-600">{errors} photos failed to load (skipped).</p>
              )}
            </div>
          </div>
          <button
            onClick={clearAndReindex}
            disabled={clearing}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${clearing ? "animate-spin" : ""}`} />
            {clearing ? "Clearing..." : "Clear & Re-index"}
          </button>
        </div>
      ) : processing ? (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-amber-800">
              <ScanFace className="h-4 w-4 animate-pulse" />
              {progress.total > 0
                ? `Indexing: ${progress.current} / ${progress.total}`
                : "Preparing..."}
            </span>
            <span className="text-sm text-amber-600">
              {progress.faces} faces
              {progress.skipped > 0 && ` · ${progress.skipped} skipped`}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-amber-200">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progress.total > 0 ? progressPercent : 0}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-amber-600">{statusText}</p>
          {errors > 0 && (
            <p className="mt-1 text-xs text-red-500">{errors} photos failed</p>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {unindexedCount} photos need face indexing
              </p>
              <p className="text-xs text-amber-600">
                Run this on a desktop browser. Tiny/blurry faces will be skipped for accuracy.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={clearAndReindex}
              disabled={clearing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-white px-3 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${clearing ? "animate-spin" : ""}`} />
              {clearing ? "Clearing..." : "Clear Old"}
            </button>
            <button
              onClick={indexFaces}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              <Play className="h-4 w-4" />
              Index Faces
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
