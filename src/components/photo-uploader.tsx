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
  RefreshCw,
  Zap,
} from "lucide-react";

interface PhotoUploaderProps {
  eventId: string;
  onComplete: () => void;
}

type UploadStatus = "pending" | "uploading" | "indexing" | "done" | "error";

interface FileItem {
  id: string;
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

// Fetch with a per-call timeout. Throws on timeout.
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err: any) {
    if (err.name === "AbortError") throw new Error(`Timed out after ${timeoutMs / 1000}s`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

const CONCURRENCY = 3; // upload 3 photos at once

export function PhotoUploader({ eventId, onComplete }: PhotoUploaderProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;
    const newFiles: FileItem[] = Array.from(selected).map((file) => ({
      id: `${file.name}-${file.size}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as UploadStatus,
      facesFound: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== id);
    });
  }

  function updateFile(id: string, patch: Partial<FileItem>) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  async function processOne(item: FileItem): Promise<void> {
    updateFile(item.id, { status: "uploading", error: undefined });

    try {
      // Step 1: Get presigned URL (15s timeout)
      const presignRes = await fetchWithTimeout(
        "/api/r2/presign",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            filename: item.file.name,
            contentType: item.file.type || "image/jpeg",
            fileSize: item.file.size,
          }),
        },
        15_000
      );

      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({}));
        throw new Error(err.error || `Presign failed (${presignRes.status})`);
      }

      const { uploadUrl, photoId } = await presignRes.json();

      // Step 2: Upload to R2 (2 min timeout — large files on slow connections)
      const uploadRes = await fetchWithTimeout(
        uploadUrl,
        {
          method: "PUT",
          body: item.file,
          headers: { "Content-Type": item.file.type || "image/jpeg" },
        },
        120_000
      );

      if (!uploadRes.ok) throw new Error(`R2 upload failed (${uploadRes.status})`);

      // Step 3: Rekognition indexing (60s timeout)
      updateFile(item.id, { status: "indexing" });

      const indexRes = await fetchWithTimeout(
        "/api/rekognition/index-photo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoId, eventId }),
        },
        60_000
      );

      const indexData = indexRes.ok ? await indexRes.json() : { faceCount: 0 };
      updateFile(item.id, { status: "done", facesFound: indexData.faceCount ?? 0 });
    } catch (err: any) {
      updateFile(item.id, {
        status: "error",
        error: err.message ?? "Upload failed",
      });
    }
  }

  const processPhotos = useCallback(
    async (targetStatus: UploadStatus = "pending") => {
      const targets = files.filter((f) => f.status === targetStatus);
      if (targets.length === 0) return;

      setProcessing(true);
      setCompleted(0);
      setTotal(targets.length);

      // Process in batches of CONCURRENCY
      for (let i = 0; i < targets.length; i += CONCURRENCY) {
        const batch = targets.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map((item) => processOne(item)));
        setCompleted((c) => c + batch.length);
      }

      setProcessing(false);
      onComplete();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files, eventId, onComplete]
  );

  const doneCount = files.filter((f) => f.status === "done").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const pendingCount = files.filter((f) => f.status === "pending").length;
  const totalFaces = files.reduce((sum, f) => sum + f.facesFound, 0);
  const progressPercent =
    total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onClick={() => !processing && fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition hover:border-primary/40 hover:bg-primary/5 ${processing ? "pointer-events-none opacity-60" : ""}`}
      >
        <Cloud className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="mb-1 text-sm font-medium">Click to select photos</p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, WebP — stored on Cloudflare R2 · {CONCURRENCY} at a time
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
            <span>{files.length} files · {doneCount} done · {errorCount} failed</span>
            <span>{formatBytes(totalSize)} total</span>
          </div>

          {/* Progress bar */}
          {processing && (
            <div className="rounded-lg bg-primary/5 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  {completed} / {total} photos processed
                  <span className="text-xs text-muted-foreground font-normal">
                    (uploading {CONCURRENCY} at a time — failed photos skipped automatically)
                  </span>
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

          {/* Success summary */}
          {!processing && doneCount > 0 && (
            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
              <span>
                <strong>{doneCount}</strong> photos uploaded to R2 ·{" "}
                <strong>{totalFaces}</strong> faces indexed via AWS
                {errorCount > 0 && (
                  <span className="ml-2 text-amber-700">
                    · <strong>{errorCount}</strong> failed (see below to retry)
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Error summary + retry */}
          {errorCount > 0 && !processing && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold flex items-center gap-1.5 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  {errorCount} photo{errorCount !== 1 ? "s" : ""} failed — click to retry
                </p>
                <button
                  onClick={() => processPhotos("error")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry {errorCount} Failed
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-0.5">
                {files.filter((f) => f.status === "error").map((f) => (
                  <p key={f.id} className="text-xs text-red-600">
                    <span className="font-medium">{f.file.name}</span>: {f.error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <img src={fileItem.preview} alt="" className="h-full w-full object-cover" />

                {fileItem.status === "uploading" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                    <span className="text-[9px] text-white/80">Uploading</span>
                  </div>
                )}
                {fileItem.status === "indexing" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60">
                    <ScanFace className="h-5 w-5 animate-pulse text-amber-400" />
                    <span className="text-[9px] text-amber-300">Indexing</span>
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
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/80 p-1 cursor-help"
                    title={fileItem.error}
                  >
                    <AlertCircle className="h-4 w-4 text-white" />
                    <span className="mt-0.5 text-center text-[9px] leading-tight text-white">
                      Failed
                    </span>
                  </div>
                )}
                {fileItem.status === "pending" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(fileItem.id); }}
                    className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-0.5 text-white group-hover:block"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          {!processing && pendingCount > 0 && (
            <div className="flex gap-3">
              <button
                onClick={() => processPhotos("pending")}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <Zap className="h-4 w-4" />
                Upload & Index ({pendingCount} photos)
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
