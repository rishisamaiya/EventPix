"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ScanFace,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

export function PhotoUploader({ eventId, onComplete }: PhotoUploaderProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

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

  const processPhotos = useCallback(async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setProgress({ current: 0, total: files.length });

    const { loadModels, detectFaces, descriptorToArray } = await import(
      "@/lib/face-detection"
    );
    await loadModels();

    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];
      if (fileItem.status === "done") continue;

      setProgress({ current: i + 1, total: files.length });

      // Step 1: Upload to Supabase Storage
      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "uploading" } : f))
      );

      const fileName = `${eventId}/${Date.now()}-${fileItem.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("event-photos")
        .upload(fileName, fileItem.file, { upsert: false });

      if (uploadError) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: "error", error: uploadError.message }
              : f
          )
        );
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-photos").getPublicUrl(fileName);

      // Step 2: Insert photo record
      const { data: photoRecord, error: insertError } = await supabase
        .from("photos")
        .insert({
          event_id: eventId,
          source_url: publicUrl,
          thumbnail_url: publicUrl,
          mime_type: fileItem.file.type,
          file_size: fileItem.file.size,
        })
        .select()
        .single();

      if (insertError || !photoRecord) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: "error", error: insertError?.message }
              : f
          )
        );
        continue;
      }

      // Step 3: Detect faces and extract embeddings
      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "indexing" } : f))
      );

      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = fileItem.preview;
        });

        const detections = await detectFaces(img);
        const faceCount = detections.length;

        if (faceCount > 0) {
          const embeddings = detections.map((d) => ({
            photo_id: photoRecord.id,
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
          .eq("id", photoRecord.id);

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "done", facesFound: faceCount } : f
          )
        );
      } catch {
        await supabase
          .from("photos")
          .update({ faces_indexed: true, face_count: 0 })
          .eq("id", photoRecord.id);

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "done", facesFound: 0 } : f
          )
        );
      }
    }

    // Update event photo count
    const { count } = await supabase
      .from("photos")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);

    await supabase
      .from("events")
      .update({ photo_count: count ?? 0 })
      .eq("id", eventId);

    setProcessing(false);
    onComplete();
  }, [files, eventId, supabase, onComplete]);

  const doneCount = files.filter((f) => f.status === "done").length;
  const totalFaces = files.reduce((sum, f) => sum + f.facesFound, 0);
  const progressPercent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition hover:border-primary/40 hover:bg-primary/5"
      >
        <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="mb-1 text-sm font-medium">
          Click to select photos or drag & drop
        </p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, WebP — select multiple files
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

      {/* File List */}
      {files.length > 0 && (
        <>
          {/* Progress Summary */}
          {processing && (
            <div className="rounded-lg bg-primary/5 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Processing {progress.current} of {progress.total}
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
                <strong>{doneCount}</strong> photos uploaded,{" "}
                <strong>{totalFaces}</strong> faces indexed
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
                <img
                  src={fileItem.preview}
                  alt=""
                  className="h-full w-full object-cover"
                />

                {/* Status Overlay */}
                {fileItem.status === "uploading" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
                {fileItem.status === "indexing" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <ScanFace className="h-5 w-5 animate-pulse text-primary" />
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
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/50">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                )}

                {/* Remove Button */}
                {fileItem.status === "pending" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
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
                Upload & Index Faces ({files.filter((f) => f.status === "pending").length} photos)
              </button>
              <button
                onClick={() => {
                  files.forEach((f) => URL.revokeObjectURL(f.preview));
                  setFiles([]);
                }}
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
