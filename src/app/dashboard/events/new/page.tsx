"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Lock, ImageIcon, Zap, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { nanoid } from "nanoid";

type Limits = {
  planId: string;
  planName: string;
  maxEvents: number;
  usage: { events: number };
  canCreateEvent: boolean;
};

export default function NewEventPage() {
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("wedding");
  const [location, setLocation] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [limits, setLimits] = useState<Limits | null>(null);
  const [limitsLoading, setLimitsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetch("/api/plans/check-limits")
      .then((r) => r.json())
      .then((data) => setLimits(data))
      .finally(() => setLimitsLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!limits?.canCreateEvent) return;
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
        event_type: eventType,
        location: location || null,
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

  if (limitsLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="h-64 rounded-2xl bg-muted/30 animate-pulse" />
      </div>
    );
  }

  // ── Plan limit wall ──
  if (limits && !limits.canCreateEvent) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Zap className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900">
            Event Limit Reached
          </h1>
          <p className="mb-1 text-slate-600">
            You&apos;re on the{" "}
            <strong>{limits.planName}</strong> plan which allows{" "}
            <strong>
              {limits.maxEvents === 1
                ? "1 event"
                : `${limits.maxEvents} events`}
            </strong>
            .
          </p>
          <p className="mb-8 text-slate-500">
            You currently have{" "}
            <strong>{limits.usage.events}</strong>{" "}
            active{" "}
            {limits.usage.events === 1 ? "event" : "events"}.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/#pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 px-8 py-3 font-bold text-white shadow-lg shadow-amber-200/50 transition hover:from-amber-600 hover:to-orange-500"
            >
              <Zap className="h-4 w-4" />
              Upgrade Plan
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-8 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to Dashboard
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Or archive an existing event to free up a slot.
          </p>
        </div>
      </div>
    );
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
        {limits && (
          <p className="mt-1 text-xs text-muted-foreground">
            {limits.planName} plan ·{" "}
            <span
              className={
                limits.usage.events >= limits.maxEvents && limits.maxEvents !== -1
                  ? "text-red-500 font-medium"
                  : "text-green-600 font-medium"
              }
            >
              {limits.usage.events} /{" "}
              {limits.maxEvents === -1 ? "∞" : limits.maxEvents} events used
            </span>
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-8">
        <form onSubmit={handleCreate} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                Event Name *
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
              <label className="mb-1.5 block text-sm font-medium">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
              >
                {[
                  ["wedding", "💍 Wedding"],
                  ["engagement", "💫 Engagement"],
                  ["birthday", "🎂 Birthday"],
                  ["corporate", "💼 Corporate"],
                  ["festival", "🎉 Festival"],
                  ["graduation", "🎓 Graduation"],
                  ["other", "📸 Other"],
                ].map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
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

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">
                Location (optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Taj Hotel, Mumbai"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4 text-muted-foreground" />
                PIN Code (optional)
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="4-6 digit PIN to protect your event"
                maxLength={6}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Guests will need this PIN to access your gallery. Leave empty
                for open access.
              </p>
            </div>
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
