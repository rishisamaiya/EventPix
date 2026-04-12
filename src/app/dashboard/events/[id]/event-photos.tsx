"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageIcon, ScanFace, Trash2, HardDrive, Upload, RefreshCw, Loader2, Clock, AlertTriangle } from "lucide-react";
import { PhotoUploader } from "@/components/photo-uploader";
import { GoogleDrivePicker } from "@/components/google-drive-picker";
import { FaceIndexer } from "@/components/face-indexer";
import { createClient } from "@/lib/supabase/client";

type Photo = {
  id: string;
  source_url: string;
  thumbnail_url: string | null;
  faces_indexed: boolean;
  face_count: number;
  drive_file_id?: string;
};

export function EventPhotos({
  eventId,
  initialPhotos,
  isGoogleConnected,
}: {
  eventId: string;
  initialPhotos: Photo[];
  isGoogleConnected: boolean;
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sourceTab, setSourceTab] = useState<"drive" | "upload">("drive");
  const [reindexing, setReindexing] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [cleaningUp, setCleaningUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Count how many images failed to load — if many fail, Drive thumbs are still processing
  const failedCount = failedImages.size;
  const drivePhotos = photos.filter((p) => p.drive_file_id);
  const thumbsStillProcessing =
    drivePhotos.length > 0 && failedCount > drivePhotos.length / 2;

  // R2 photos with 0 faces = failed uploads (file never reached R2)
  const brokenR2Count = photos.filter((p) => !p.drive_file_id && p.face_count === 0).length;

  async function handleCleanupFailed() {
    if (!confirm(`Remove ${brokenR2Count} failed upload records? You can re-upload the photos after this.`)) return;
    setCleaningUp(true);
    try {
      const res = await fetch("/api/r2/cleanup-failed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.drive_file_id || p.face_count > 0));
        alert(`Removed ${data.deleted} broken records. Now re-upload your photos.`);
      } else {
        alert(data.error || "Cleanup failed");
      }
    } catch {
      alert("Cleanup request failed");
    }
    setCleaningUp(false);
  }

  async function handleReindexWithAWS() {
    if (!confirm(`This will clear all existing face data and re-index all ${photos.length} photos using AWS Rekognition. Continue?`)) return;
    setReindexing(true);
    try {
      const res = await fetch("/api/clear-embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (!res.ok) throw new Error("Failed to clear");
      // Update local state so FaceIndexer appears immediately (router.refresh alone won't update useState)
      setPhotos((prev) => prev.map((p) => ({ ...p, faces_indexed: false, face_count: 0 })));
    } catch (err) {
      alert("Failed to reset face data. Please try again.");
    } finally {
      setReindexing(false);
    }
  }

  async function deletePhoto(photoId: string) {
    setDeleting(photoId);
    await supabase.from("face_embeddings").delete().eq("photo_id", photoId);
    await supabase.from("photos").delete().eq("id", photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));

    const newCount = photos.length - 1;
    await supabase
      .from("events")
      .update({ photo_count: newCount })
      .eq("id", eventId);

    setDeleting(null);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Photos</h2>
        <span className="text-sm text-muted-foreground">
          {photos.length} total
        </span>
      </div>

      {/* Source Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSourceTab("drive")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            sourceTab === "drive"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <HardDrive className="h-4 w-4" />
          Google Drive
        </button>
        <button
          onClick={() => setSourceTab("upload")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            sourceTab === "upload"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Upload className="h-4 w-4" />
          Direct Upload
          <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
            10GB FREE
          </span>
        </button>
      </div>

      {/* Source Content */}
      {sourceTab === "drive" ? (
        <GoogleDrivePicker
          eventId={eventId}
          isConnected={isGoogleConnected}
          onImportComplete={() => router.refresh()}
        />
      ) : (
        <PhotoUploader eventId={eventId} onComplete={() => router.refresh()} />
      )}

      {/* Face Indexing — always visible when photos exist */}
      {photos.length > 0 && (
        <div className="mt-4 space-y-3">
          <FaceIndexer
            eventId={eventId}
            unindexedCount={photos.filter((p) => !p.faces_indexed).length}
            onComplete={() => router.refresh()}
          />
          {/* Show Re-index button when all photos are already indexed (old face-api.js data) */}
          {photos.every((p) => p.faces_indexed) && (
            <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-indigo-800">Re-index with AWS Rekognition</p>
                <p className="text-xs text-indigo-600">
                  Clears old face data and re-indexes using AWS for much better accuracy.
                </p>
              </div>
              <button
                onClick={handleReindexWithAWS}
                disabled={reindexing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {reindexing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {reindexing ? "Clearing..." : "Re-index Now"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Broken R2 uploads banner */}
      {brokenR2Count > 0 && (
        <div className="mt-4 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {brokenR2Count} photos failed to upload to R2
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Files never reached Cloudflare R2 (missing env vars at upload time). Clear these records, then re-upload.
              </p>
            </div>
          </div>
          <button
            onClick={handleCleanupFailed}
            disabled={cleaningUp}
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {cleaningUp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            {cleaningUp ? "Clearing..." : "Clear & Re-upload"}
          </button>
        </div>
      )}

      {/* Existing Photos Grid */}
      {photos.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ScanFace className="h-4 w-4" />
              <span>
                {photos.filter((p) => p.faces_indexed).length} indexed,{" "}
                {photos.reduce((sum, p) => sum + (p.face_count || 0), 0)} faces found
              </span>
            </div>
            {thumbsStillProcessing && (
              <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-700">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                Google Drive is still generating thumbnails for new photos — refresh in ~2 min
                <button
                  onClick={() => router.refresh()}
                  className="ml-1 font-semibold underline hover:no-underline"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <img
                  src={photo.thumbnail_url || photo.source_url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedImages((prev) => new Set(prev).add(photo.id))
                  }
                />
                {photo.drive_file_id && (
                  <div className="absolute left-1 top-1">
                    <HardDrive className="h-3 w-3 text-white drop-shadow" />
                  </div>
                )}
                {photo.faces_indexed && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-0.5 text-center">
                    <span className="text-[10px] text-white">
                      {photo.face_count} face{photo.face_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => deletePhoto(photo.id)}
                  disabled={deleting === photo.id}
                  className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white/80 transition hover:bg-red-500 hover:text-white group-hover:block"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-10">
          <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {sourceTab === "drive"
              ? "Connect Google Drive to import photos"
              : "Upload photos above to get started"}
          </p>
        </div>
      )}
    </div>
  );
}
