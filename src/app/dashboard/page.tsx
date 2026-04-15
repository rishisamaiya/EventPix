import Link from "next/link";
import {
  Plus,
  Calendar,
  ImageIcon,
  Users,
  Sparkles,
  CreditCard,
  PlayCircle,
  HeadphonesIcon,
  Share2,
  ChevronRight,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("host_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user!.id)
    .eq("status", "active")
    .maybeSingle();

  const planName = subscription?.plan ?? "free";
  const eventCount = events?.length ?? 0;

  const totalPhotos = events?.reduce((sum, e) => sum + (e.photo_count ?? 0), 0) ?? 0;

  return (
    <div className="flex gap-6 lg:gap-8">

      {/* ── Main Column ── */}
      <div className="flex-1 min-w-0">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Your Events</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage and share your photo galleries
            </p>
          </div>
          <Link
            href="/dashboard/events/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:from-blue-700 hover:to-sky-600"
          >
            <Plus className="h-4 w-4" />
            New Event
          </Link>
        </div>

        {/* Stats bar */}
        {eventCount > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[
              { label: "Events", value: eventCount, icon: Calendar, color: "text-blue-600 bg-blue-50" },
              { label: "Photos", value: totalPhotos, icon: ImageIcon, color: "text-violet-600 bg-violet-50" },
              { label: "Plan", value: planName.charAt(0).toUpperCase() + planName.slice(1), icon: Zap, color: "text-amber-600 bg-amber-50" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-white p-4 flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-base font-bold text-slate-800">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Events Grid or Empty State */}
        {!events || events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-sky-50">
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-slate-800">No events yet</h3>
            <p className="mb-6 max-w-xs text-center text-sm text-slate-400">
              Create your first event to start sharing photos with your guests.
            </p>
            <Link
              href="/dashboard/events/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:from-blue-700 hover:to-sky-600"
            >
              <Plus className="h-4 w-4" />
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => {
              const isActive = event.status === "active";
              return (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="group relative flex flex-col rounded-2xl border border-slate-100 bg-white overflow-hidden transition hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50"
                >
                  {/* Cover image */}
                  {event.cover_url ? (
                    <div className="h-36 overflow-hidden bg-slate-100">
                      <img
                        src={event.cover_url}
                        alt={event.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="h-36 flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
                      <Calendar className="h-10 w-10 text-blue-300" />
                    </div>
                  )}

                  {/* Status badge */}
                  <span
                    className={`absolute top-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {event.status ?? "Draft"}
                  </span>

                  {/* Info */}
                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="mb-1 font-semibold text-slate-800 group-hover:text-blue-600 transition">
                      {event.name}
                    </h3>
                    <p className="mb-3 text-xs text-slate-400">
                      {event.event_date
                        ? new Date(event.event_date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Date not set"}
                    </p>
                    <div className="mt-auto flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="h-3.5 w-3.5" />
                        {event.photo_count ?? 0} photos
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {event.guest_count ?? 0} guests
                      </span>
                      {event.privacy_mode && (
                        <span className="ml-auto flex items-center gap-1 text-violet-500">
                          <Sparkles className="h-3 w-3" />
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Add Event card */}
            <Link
              href="/dashboard/events/new"
              className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-8 text-center transition hover:border-blue-300 hover:bg-blue-50/30"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 transition group-hover:bg-blue-200">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 group-hover:text-blue-700">New Event</p>
            </Link>
          </div>
        )}
      </div>

      {/* ── Right Quick Panel ── */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col gap-4 flex-shrink-0">

        {/* Plan card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Plan</p>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
              {planName}
            </span>
          </div>
          <div className="space-y-1.5 text-sm text-slate-600 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Events</span>
              <span className="font-medium">{eventCount} created</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Photos</span>
              <span className="font-medium">{totalPhotos} indexed</span>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <CreditCard className="h-3.5 w-3.5" />
            View Plan & Billing
          </Link>
        </div>

        {/* Getting Started */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Quick Start</p>
          <div className="space-y-1">
            {[
              { icon: Plus,            label: "Create an event",      href: "/dashboard/events/new" },
              { icon: Share2,          label: "Share with guests",    href: "/help" },
              { icon: PlayCircle,      label: "How it works",         href: "/help" },
              { icon: HeadphonesIcon,  label: "Talk to support",      href: "/contact" },
            ].map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition hover:bg-slate-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-blue-100 transition">
                  <Icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600" />
                </div>
                <span className="flex-1 text-xs font-medium text-slate-600 group-hover:text-slate-900">{label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500" />
              </Link>
            ))}
          </div>
        </div>

        {/* Upgrade nudge (only for free plan) */}
        {planName === "free" && (
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 p-4 text-white">
            <Sparkles className="mb-2 h-5 w-5 opacity-80" />
            <p className="mb-1 text-sm font-semibold">Unlock More Features</p>
            <p className="mb-3 text-xs opacity-75">
              Upgrade to get unlimited photos, more events, and priority support.
            </p>
            <Link
              href="/dashboard/billing"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-xs font-semibold backdrop-blur-sm transition hover:bg-white/30"
            >
              View Plans <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
