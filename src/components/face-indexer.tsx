"use client";

import { useState, useCallback } from "react";
import { ScanFace, CheckCircle2, AlertCircle, Play, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FaceIndexerProps {
  eventId: string;
  unindexedCount: number;
  onComplete: () => void;
}

export function FaceIndexer({ eventId, unindexedCount, onComplete }: FaceIndexerProps) {
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 0, faces: 0 });
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
      setProgress({ current: 0, total: 0, faces: 0 });
      setErrors(0);
      setFatalError(null);
      setStatusText("Cleared old data. Ready to re-index.");
      onComplete();
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
      const { data: photos, error: queryError } = await supabase
        .from("photos")
        .select("id")
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

      setProgress({ current: 0, total: photos.length, faces: 0 });
      let totalFaces = 0;
      let errorCount = 0;

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        setProgress((p) => ({ ...p, current: i + 1 }));
        setStatusText(`Photo ${i + 1} / ${photos.length}: sending to AWS Rekognition...`);

        try {
          const res = await fetch("/api/rekognition/index-photo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ photoId: photo.id, eventId }),
          });

          const json = await res.json();
          if (res.ok) {
            totalFaces += json.faceCount ?? 0;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }

        setProgress((p) => ({ ...p, faces: totalFaces }));
        setErrors(errorCount);
      }

      setStatusText("Done! AWS Rekognition indexing complete.");
      setProcessing(false);
      setDone(true);
      onComplete();
    } catch (err) {
      setFatalError(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
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
                AWS Rekognition indexing complete — {progress.faces} faces found across{" "}
                {progress.total} photos.
              </p>
              {errors > 0 && (
                <p className="text-xs text-amber-600">{errors} photos had errors (skipped).</p>
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
                ? `Indexing via AWS: ${progress.current} / ${progress.total}`
                : "Preparing..."}
            </span>
            <span className="text-sm text-amber-600">{progress.faces} faces found</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-amber-200">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
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
                Uses AWS Rekognition — much more accurate than before.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearAndReindex}
              disabled={clearing}
              title="Clear old face data and re-index"
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
