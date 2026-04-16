"use client";

import { useState } from "react";
import {
  ImageIcon, Users, BarChart2, Share2, ScanFace, TrendingUp,
  HardDrive, Zap, Check, Clock, ExternalLink, Copy, CheckCircle2,
} from "lucide-react";
import { EventPhotos } from "./event-photos";
import { PrivacyModeToggle } from "./privacy-mode-toggle";

type Tab = "overview" | "guests" | "analytics";

type Props = {
  event: any;
  photos: any[];
  sessions: any[];
  shareUrl: string;
};

/* ── Guests table ── */
function GuestsTab({ sessions }: { sessions: any[] }) {
  const totalVisits = sessions.length;
  const uniqueGuests = new Set(sessions.filter(s => s.guest_name).map(s => s.guest_name.toLowerCase())).size;
  const withMatches = sessions.filter((s) => (s.matched_photo_count ?? 0) > 0).length;

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { icon: <Users className="h-5 w-5 text-blue-500" />, label: "Unique Guests", value: uniqueGuests || totalVisits, bg: "bg-blue-50" },
          { icon: <ScanFace className="h-5 w-5 text-purple-500" />, label: "Total Searches", value: totalVisits, bg: "bg-purple-50" },
          { icon: <ImageIcon className="h-5 w-5 text-green-500" />, label: "Found Photos", value: withMatches, bg: "bg-green-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {sessions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="font-medium text-muted-foreground">No guest visits yet</p>
            <p className="text-sm text-muted-foreground">
              Share the event link and guest visits will appear here.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Guest</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Visit</div>
                </th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Contact</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Photos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sessions.map((session: any) => (
                <tr key={session.id} className="hover:bg-muted/20">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {session.guest_name ? session.guest_name[0].toUpperCase() : "?"}
                      </div>
                      <span className="font-medium">
                        {session.guest_name || <span className="italic text-muted-foreground">Anonymous</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">
                    {new Date(session.created_at).toLocaleString("en-IN", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    {session.phone ? (
                      <span className="font-medium text-slate-700">{session.phone}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {(session.matched_photo_count ?? 0) > 0 ? (
                      <span className="font-semibold text-green-600">{session.matched_photo_count}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Analytics tab ── */
function AnalyticsTab({ event, sessions, photos }: { event: any; sessions: any[]; photos: any[] }) {
  const totalVisits = sessions.length;
  const successfulMatches = sessions.filter((s) => (s.matched_photo_count ?? 0) > 0).length;
  const matchRate = totalVisits > 0 ? Math.round((successfulMatches / totalVisits) * 100) : 0;
  const totalStorage = photos.reduce((sum, p) => sum + (p.file_size ?? 0), 0);
  const storageGB = (totalStorage / (1024 * 1024 * 1024)).toFixed(2);
  const facesIndexed = photos.filter((p) => p.faces_indexed).length;
  const totalFaces = photos.reduce((sum, p) => sum + (p.face_count ?? 0), 0);

  // visits by day
  const visitsByDay: Record<string, number> = {};
  sessions.forEach((s) => {
    const day = new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    visitsByDay[day] = (visitsByDay[day] ?? 0) + 1;
  });
  const chartData = Object.entries(visitsByDay).slice(-7);
  const maxVisits = Math.max(...chartData.map(([, v]) => v), 1);

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: <ImageIcon className="h-5 w-5 text-blue-500" />, label: "Photos", value: event.photo_count ?? 0, bg: "bg-blue-50" },
          { icon: <Users className="h-5 w-5 text-purple-500" />, label: "Total Visits", value: totalVisits, bg: "bg-purple-50" },
          { icon: <ScanFace className="h-5 w-5 text-indigo-500" />, label: "Successful Matches", value: successfulMatches, bg: "bg-indigo-50" },
          { icon: <TrendingUp className="h-5 w-5 text-green-500" />, label: "Match Rate", value: `${matchRate}%`, bg: "bg-green-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-5 font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Guest Visits (Last 7 days)
          </h3>
          {chartData.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No visits yet</div>
          ) : (
            <div className="flex h-32 items-end gap-1.5">
              {chartData.map(([day, count]) => (
                <div key={day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{count}</span>
                  <div
                    className="w-full rounded-t-md bg-primary/70 transition-all hover:bg-primary"
                    style={{ height: `${(count / maxVisits) * 96}px` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 font-semibold flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" /> Storage Used
            </h3>
            <p className="text-3xl font-bold">{storageGB} GB</p>
            <p className="text-sm text-muted-foreground">
              {event.storage_type === "google_drive" ? "Google Drive" : "Cloudflare R2"}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" /> AI Face Recognition
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-2xl font-bold">{facesIndexed}</p><p className="text-xs text-muted-foreground">Photos indexed</p></div>
              <div><p className="text-2xl font-bold">{totalFaces}</p><p className="text-xs text-muted-foreground">Faces detected</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main client component ── */
export function EventDetailClient({ event, photos, sessions, shareUrl }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const guestCount = sessions.length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "overview",  label: "Overview",  icon: <ImageIcon className="h-4 w-4" />, count: event.photo_count ?? 0 },
    { id: "guests",    label: "Guests",    icon: <Users className="h-4 w-4" />, count: guestCount },
    { id: "analytics", label: "Analytics", icon: <BarChart2 className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

      {/* ── LEFT SIDEBAR: Settings ── */}
      <aside className="w-full flex-shrink-0 space-y-4 lg:w-72">

        {/* Event info card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {event.cover_url ? (
            <div className="relative h-36 w-full overflow-hidden">
              <img src={event.cover_url} alt={event.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  event.status === "active" ? "bg-green-500 text-white" : "bg-yellow-400 text-yellow-900"
                }`}>{event.status}</span>
              </div>
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border">
              <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                event.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>{event.status}</div>
            </div>
          )}
          <div className="p-4">
            <h1 className="font-bold text-foreground text-base leading-tight">{event.name}</h1>
            {event.event_type && event.event_type !== "other" && (
              <p className="mt-0.5 text-xs text-muted-foreground capitalize">{event.event_type}</p>
            )}
            {event.event_date && (
              <p className="mt-1 text-xs text-muted-foreground">
                📅 {new Date(event.event_date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
              </p>
            )}
            {event.location && (
              <p className="mt-0.5 text-xs text-muted-foreground">📍 {event.location}</p>
            )}
          </div>
        </div>

        {/* Share link */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Share2 className="h-4 w-4 text-muted-foreground" /> Share with Guests
          </h3>
          <div className="mb-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
            <code className="text-[11px] break-all text-muted-foreground">{shareUrl}</code>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-medium transition hover:bg-muted"
            >
              {copied ? <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open
            </a>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Gallery Settings</h3>
          <PrivacyModeToggle eventId={event.id} initialPrivacyMode={event.privacy_mode ?? false} />

          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Downloads</span>
              <span className="font-medium">{event.allow_download !== false ? "Allowed" : "Disabled"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">PIN Code</span>
              <span className="font-medium">{event.pin_code ? "🔒 Protected" : "Open"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-medium capitalize">{event.storage_type?.replace("_", " ") ?? "—"}</span>
            </div>
          </div>

          <a
            href={`/dashboard/events/${event.id}/settings`}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            Edit All Settings →
          </a>
        </div>
      </aside>

      {/* ── RIGHT MAIN CONTENT ── */}
      <div className="flex-1 min-w-0">
        {/* Tab bar */}
        <div className="mb-5 flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              {t.icon}
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "overview" && (
          <EventPhotos
            eventId={event.id}
            initialPhotos={photos}
            isGoogleConnected={!!event.cloud_config?.access_token}
          />
        )}
        {tab === "guests" && <GuestsTab sessions={sessions} />}
        {tab === "analytics" && <AnalyticsTab event={event} sessions={sessions} photos={photos} />}
      </div>
    </div>
  );
}
