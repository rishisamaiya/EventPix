"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageIcon, ScanFace, Trash2, HardDrive, Upload } from "lucide-react";
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
  const router = useRouter();
  const supabase = createClient();

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
          <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-bold text-yellow-700">
            1GB LIMIT
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

      {/* Face Indexer for unindexed photos */}
      {photos.length > 0 && (
        <div className="mt-4">
          <FaceIndexer
            eventId={eventId}
            unindexedCount={photos.filter((p) => !p.faces_indexed).length}
            onComplete={() => router.refresh()}
          />
        </div>
      )}

      {/* Existing Photos Grid */}
      {photos.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <ScanFace className="h-4 w-4" />
            <span>
              {photos.filter((p) => p.faces_indexed).length} indexed,{" "}
              {photos.reduce((sum, p) => sum + (p.face_count || 0), 0)} faces
              found
            </span>
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
