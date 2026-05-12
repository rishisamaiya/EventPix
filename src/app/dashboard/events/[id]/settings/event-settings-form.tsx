"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CoverPhotoUploader } from "@/components/cover-photo-uploader";

type Props = {
  event: {
    id: string;
    name: string;
    event_date: string | null;
    event_type: string | null;
    location: string | null;
    description: string | null;
    pin_code: string | null;
    allow_download: boolean;
    download_quality: string | null;
    privacy_mode: boolean | null;
    cover_url: string | null;
  };
};

const EVENT_TYPES = [
  ["wedding", "💍 Wedding"],
  ["engagement", "💫 Engagement"],
  ["birthday", "🎂 Birthday"],
  ["corporate", "💼 Corporate"],
  ["festival", "🎉 Festival"],
  ["graduation", "🎓 Graduation"],
  ["other", "📸 Other"],
];

export function EventSettingsForm({ event }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(event.name);
  const [eventDate, setEventDate] = useState(event.event_date?.split("T")[0] ?? "");
  const [eventType, setEventType] = useState(event.event_type ?? "other");
  const [location, setLocation] = useState(event.location ?? "");
  const [description, setDescription] = useState(event.description ?? "");
  const [pin, setPin] = useState(event.pin_code ?? "");
  const [allowDownload, setAllowDownload] = useState(event.allow_download ?? true);
  const [downloadQuality, setDownloadQuality] = useState(event.download_quality ?? "original");
  const [privacyMode, setPrivacyMode] = useState(event.privacy_mode ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const { error: updateError } = await supabase
      .from("events")
      .update({
        name,
        event_date: eventDate || null,
        event_type: eventType,
        location: location || null,
        description: description || null,
        pin_code: pin || null,
        allow_download: allowDownload,
        download_quality: downloadQuality,
        privacy_mode: privacyMode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", event.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-10">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* General */}
      <section>
        <h3 className="mb-5 border-b border-border pb-2 text-base font-semibold">
          General
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Cover photo - full width */}
          <div className="sm:col-span-2">
            <CoverPhotoUploader
              eventId={event.id}
              currentCoverUrl={event.cover_url}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Event Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
            >
              {EVENT_TYPES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Event Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Taj Hotel, Mumbai"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is this event about?"
              className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">PIN Code</label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Leave empty for open access"
              maxLength={6}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
            />
          </div>
        </div>
      </section>

      {/* Media Privacy */}
      <section>
        <h3 className="mb-5 border-b border-border pb-2 text-base font-semibold">
          Media Privacy
        </h3>

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPrivacyMode(false)}
            className={`rounded-xl border-2 p-4 text-left transition ${
              !privacyMode
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border/80"
            }`}
          >
            <p className="font-semibold">🌐 Public</p>
            <p className="mt-1 text-xs text-muted-foreground">
              All uploaded photos are visible to guests. Selfie search filters to their photos.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPrivacyMode(true)}
            className={`rounded-xl border-2 p-4 text-left transition ${
              privacyMode
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border/80"
            }`}
          >
            <p className="font-semibold">🔒 Private (Selfie Only)</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Photos appear blurred. Guests must upload a selfie to unlock their matched photos.
            </p>
          </button>
        </div>

        {/* Downloads */}
        <div className="rounded-xl border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Downloads</p>
              <p className="text-xs text-muted-foreground">
                Let guests download their matched photos
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAllowDownload(!allowDownload)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                allowDownload ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  allowDownload ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {allowDownload && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Download quality:</p>
              <div className="flex gap-2">
                {[["original", "Original"], ["2560px", "2560px"], ["1600px", "1600px"]].map(([v, l]) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setDownloadQuality(v)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                      downloadQuality === v
                        ? "border-primary bg-primary/10 font-medium text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-4 w-4" /> Save Changes</>
          )}
        </button>
        {saved && (
          <span className="text-sm font-medium text-green-600">
            ✓ Changes saved
          </span>
        )}
      </div>
    </form>
  );
}
