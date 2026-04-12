"use client";

import { useState, useCallback } from "react";
import { ScanFace, Loader2, CheckCircle2, AlertCircle, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FaceIndexerProps {
  eventId: string;
  unindexedCount: number;
  onComplete: () => void;
}

export function FaceIndexer({ eventId, unindexedCount, onComplete }: FaceIndexerProps) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, faces: 0 });
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);
  const supabase = createClient();

  const indexFaces = useCallback(async () => {
    setProcessing(true);
    setDone(false);
    setErrors(0);

    const { loadModels, detectFaces, descriptorToArray } = await import(
      "@/lib/face-detection"
    );

    setProgress((p) => ({ ...p, current: 0, total: 0, faces: 0 }));

    await loadModels();

    const { data: photos } = await supabase
      .from("photos")
      .select("id, thumbnail_url, source_url")
      .eq("event_id", eventId)
      .eq("faces_indexed", false)
      .order("created_at", { ascending: true });

    if (!photos || photos.length === 0) {
      setProcessing(false);
      setDone(true);
      return;
    }

    setProgress({ current: 0, total: photos.length, faces: 0 });
    let totalFaces = 0;
    let errorCount = 0;

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      setProgress((p) => ({ ...p, current: i + 1 }));

      try {
        const imgUrl = photo.thumbnail_url || photo.source_url;
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load"));
          const fullUrl = imgUrl.startsWith("/")
            ? `${window.location.origin}${imgUrl}`
            : imgUrl;
          img.src = fullUrl;
        });

        const detections = await detectFaces(img);
        const faceCount = detections.length;
        totalFaces += faceCount;

        if (faceCount > 0) {
          const embeddings = detections.map((d) => ({
            photo_id: photo.id,
            event_id: eventId,
            embedding: `[${descriptorToArray(d.descriptor).join(",")}]`,
            bbox_x: d.detection.box.x / img.width,
            bbox_y: d.detection.box.y / img.height,
            bbox_w: d.detection.box.width / img.width,
            bbox_h: d.detection.box.height / img.height,
          }));

          await supabase.from("face_embeddings").insert(embeddings);
        }

        await supabase
          .from("photos")
          .update({ faces_indexed: true, face_count: faceCount })
          .eq("id", photo.id);

        setProgress((p) => ({ ...p, faces: totalFaces }));
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

    setProcessing(false);
    setDone(true);
    onComplete();
  }, [eventId, supabase, onComplete]);

  const progressPercent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  if (unindexedCount === 0 && !done) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      {done ? (
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">
              Indexing complete! Found {progress.faces} faces across{" "}
              {progress.total} photos.
            </p>
            {errors > 0 && (
              <p className="text-xs text-amber-600">
                {errors} photos failed (skipped).
              </p>
            )}
          </div>
        </div>
      ) : processing ? (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-amber-800">
              <ScanFace className="h-4 w-4 animate-pulse" />
              Indexing faces: {progress.current} / {progress.total}
            </span>
            <span className="text-sm text-amber-600">
              {progress.faces} faces found
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-amber-200">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-amber-600">
            Keep this tab open. Processing photos in your browser...
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {unindexedCount} photos need face indexing
              </p>
              <p className="text-xs text-amber-600">
                Required for selfie matching to work
              </p>
            </div>
          </div>
          <button
            onClick={indexFaces}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            <Play className="h-4 w-4" />
            Index Faces
          </button>
        </div>
      )}
    </div>
  );
}
