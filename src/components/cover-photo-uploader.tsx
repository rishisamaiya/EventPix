"use client";

import { useState, useRef } from "react";
import { ImageIcon, Upload, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

type Props = {
  eventId: string;
  currentCoverUrl: string | null;
  onUpdate?: (url: string) => void;
};

export function CoverPhotoUploader({ eventId, currentCoverUrl, onUpdate }: Props) {
  const [coverUrl, setCoverUrl] = useState<string | null>(currentCoverUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const ext = file.name.split(".").pop();
      const path = `covers/${eventId}/cover.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("event-covers")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        // Bucket might not exist — fall back to a public URL from the file
        // Use a data URL as fallback for preview, store the Supabase URL when bucket exists
        const dataUrl = await fileToDataUrl(file);
        setCoverUrl(dataUrl);

        // Still try to update the event with a placeholder note
        setError("Storage bucket not configured — cover preview shown but not saved. Set up 'event-covers' bucket in Supabase.");
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("event-covers")
        .getPublicUrl(path);

      // Update event record
      await supabase.from("events").update({ cover_url: publicUrl }).eq("id", eventId);

      setCoverUrl(publicUrl);
      onUpdate?.(publicUrl);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    await supabase.from("events").update({ cover_url: null }).eq("id", eventId);
    setCoverUrl(null);
    onUpdate?.("");
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">Cover Photo</label>

      {coverUrl ? (
        <div className="group relative h-48 w-full overflow-hidden rounded-xl border border-border">
          <Image src={coverUrl} alt="Event cover" fill className="object-cover" unoptimized />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-800 transition hover:bg-white"
            >
              <Upload className="h-3.5 w-3.5" />
              Change
            </button>
            <button
              onClick={handleRemove}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/90 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-500"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/20 transition hover:border-primary hover:bg-muted/40 disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><p className="text-sm text-muted-foreground">Uploading...</p></>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload cover photo</p>
                <p className="text-xs text-muted-foreground">JPG, PNG or WebP · Max 5MB</p>
              </div>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="mt-2 text-xs text-amber-600">{error}</p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}
