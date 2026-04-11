"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Lock, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { nanoid } from "nanoid";

export default function NewEventPage() {
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const slug = nanoid(10);

    const { data, error: insertError } = await supabase
      .from("events")
      .insert({
        name,
        event_date: eventDate || null,
        pin_code: pin || null,
        share_slug: slug,
        host_id: user.id,
        storage_type: "google_drive",
        status: "draft",
        photo_count: 0,
        guest_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push(`/dashboard/events/${data.id}`);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create New Event</h1>
        <p className="text-muted-foreground">
          Set up your event and start sharing photos.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8">
        <form onSubmit={handleCreate} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              Event Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Anurag & Kratika Wedding"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Event Date
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
              <Lock className="h-4 w-4 text-muted-foreground" />
              PIN Code (optional)
            </label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="4-6 digit PIN to protect your event"
              maxLength={6}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Guests will need this PIN to access your gallery. Leave empty for
              open access.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/dashboard"
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition hover:bg-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !name}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
