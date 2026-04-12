"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ScanFace,
  X,
  Cloud,
} from "lucide-react";

interface PhotoUploaderProps {
  eventId: string;
  onComplete: () => void;
}

type UploadStatus = "pending" | "uploading" | "indexing" | "done" | "error";

interface FileItem {
  file: File;
  preview: string;
  status: UploadStatus;
  facesFound: number;
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PhotoUploader({ eventId, onComplete }: PhotoUploaderProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;
    const newFiles: FileItem[] = Array.from(selected).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as UploadStatus,
      facesFound: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  const processPhotos = useCallback(async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) return;

    setProcessing(true);
    setProgress({ current: 0, total: pending.length });
    let processed = 0;

    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];
      if (fileItem.status !== "pending") continue;

      processed++;
      setProgress({ current: processed, total: pending.length });

      // Step 1: Get presigned URL from our server + create DB record
      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "uploading" } : f))
      );

      try {
        const presignRes = await fetch("/api/r2/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            filename: fileItem.file.name,
            contentType: fileItem.file.type || "image/jpeg",
            fileSize: fileItem.file.size,
          }),
        });

        if (!presignRes.ok) {
          const err = await presignRes.json();
          throw new Error(err.error || "Failed to get upload URL");
        }

        const { uploadUrl, photoId } = await presignRes.json();

        // Step 2: Upload directly to Cloudflare R2 via presigned URL
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: fileItem.file,
          headers: { "Content-Type": fileItem.file.type || "image/jpeg" },
        });

        if (!uploadRes.ok) throw new Error("Upload to R2 failed");

        // Step 3: Trigger Rekognition indexing server-side
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: "indexing" } : f))
        );

        const indexRes = await fetch("/api/rekognition/index-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoId, eventId }),
        });

        const indexData = indexRes.ok ? await indexRes.json() : { faceCount: 0 };

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: "done", facesFound: indexData.faceCount ?? 0 }
              : f
          )
        );
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: "error", error: err.message ?? "Upload failed" }
              : f
          )
        );
      }
    }

    setProcessing(false);
    onComplete();
  }, [files, eventId, onComplete]);

  const doneCount = files.filter((f) => f.status === "done").length;
  const totalFaces = files.reduce((sum, f) => sum + f.facesFound, 0);
  const progressPercent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition hover:border-primary/40 hover:bg-primary/5"
      >
        <Cloud className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="mb-1 text-sm font-medium">Click to select photos</p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, WebP — stored on Cloudflare R2
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <>
          {/* Size summary */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{files.length} files selected</span>
            <span>{formatBytes(totalSize)} total</span>
          </div>

          {/* Progress */}
          {processing && (
            <div className="rounded-lg bg-primary/5 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Uploading {progress.current} of {progress.total}
                </span>
                <span className="text-muted-foreground">{progressPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {!processing && doneCount > 0 && (
            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 text-sm">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>
                <strong>{doneCount}</strong> photos uploaded to R2 ·{" "}
                <strong>{totalFaces}</strong> faces indexed via AWS
              </span>
            </div>
          )}

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {files.map((fileItem, index) => (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <img src={fileItem.preview} alt="" className="h-full w-full object-cover" />
                {fileItem.status === "uploading" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
                {fileItem.status === "indexing" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <ScanFace className="h-5 w-5 animate-pulse text-amber-400" />
                  </div>
                )}
                {fileItem.status === "done" && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5 text-center">
                    <span className="text-[10px] text-white">
                      {fileItem.facesFound} face{fileItem.facesFound !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {fileItem.status === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/60 p-1">
                    <AlertCircle className="h-4 w-4 text-white" />
                    <span className="mt-0.5 text-center text-[9px] leading-tight text-white">
                      {fileItem.error?.slice(0, 20)}
                    </span>
                  </div>
                )}
                {fileItem.status === "pending" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-0.5 text-white group-hover:block"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          {!processing && files.some((f) => f.status === "pending") && (
            <div className="flex gap-3">
              <button
                onClick={processPhotos}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <ScanFace className="h-4 w-4" />
                Upload & Index ({files.filter((f) => f.status === "pending").length} photos)
              </button>
              <button
                onClick={() => { files.forEach((f) => URL.revokeObjectURL(f.preview)); setFiles([]); }}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-secondary"
              >
                Clear All
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
