import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, ScanFace, HardDrive, Zap, ImageIcon, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EventTabs } from "@/components/event-tabs";

export default async function EventAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("host_id", user.id)
    .single();

  if (!event) notFound();

  const { data: sessions } = await supabase
    .from("guest_sessions")
    .select("created_at, matched_photo_count, selfie_embedding")
    .eq("event_id", id)
    .order("created_at", { ascending: true });

  const { data: photos } = await supabase
    .from("photos")
    .select("file_size, faces_indexed, face_count")
    .eq("event_id", id)
    .is("deleted_at", null);

  // Compute analytics
  const totalVisits = sessions?.length ?? 0;
  const selfieSearches = sessions?.filter((s) => s.selfie_embedding !== null).length ?? 0;
  const successfulMatches = sessions?.filter((s) => (s.matched_photo_count ?? 0) > 0).length ?? 0;
  const matchRate = selfieSearches > 0 ? Math.round((successfulMatches / selfieSearches) * 100) : 0;
  const totalStorage = photos?.reduce((sum, p) => sum + (p.file_size ?? 0), 0) ?? 0;
  const storageGB = (totalStorage / (1024 * 1024 * 1024)).toFixed(2);
  const facesIndexed = photos?.filter((p) => p.faces_indexed).length ?? 0;
  const totalFaces = photos?.reduce((sum, p) => sum + (p.face_count ?? 0), 0) ?? 0;

  // Group visits by day for a simple chart
  const visitsByDay: Record<string, number> = {};
  sessions?.forEach((s) => {
    const day = new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    visitsByDay[day] = (visitsByDay[day] ?? 0) + 1;
  });
  const chartData = Object.entries(visitsByDay).slice(-7); // Last 7 days
  const maxVisits = Math.max(...chartData.map(([, v]) => v), 1);

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <p className="text-sm text-muted-foreground">Analytics</p>
      </div>

      <EventTabs eventId={id} />

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: <ImageIcon className="h-5 w-5 text-blue-500" />, label: "Photos", value: event.photo_count ?? 0, bg: "bg-blue-50" },
          { icon: <Users className="h-5 w-5 text-purple-500" />, label: "Total Visits", value: totalVisits, bg: "bg-purple-50" },
          { icon: <ScanFace className="h-5 w-5 text-indigo-500" />, label: "Selfie Searches", value: selfieSearches, bg: "bg-indigo-50" },
          { icon: <TrendingUp className="h-5 w-5 text-green-500" />, label: "Match Rate", value: `${matchRate}%`, bg: "bg-green-50" },
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Visits Chart */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-5 font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Guest Visits (Last 7 days)
          </h3>
          {chartData.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No visits yet
            </div>
          ) : (
            <div className="flex h-32 items-end gap-1.5">
              {chartData.map(([day, count]) => (
                <div key={day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{count}</span>
                  <div
                    className="w-full rounded-t-md bg-primary/70 transition-all hover:bg-primary"
                    style={{ height: `${(count / maxVisits) * 96}px` }}
                    title={`${day}: ${count} visits`}
                  />
                  <span className="text-[10px] text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Storage & AI */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              Storage Used
            </h3>
            <p className="text-3xl font-bold">{storageGB} GB</p>
            <p className="text-sm text-muted-foreground">
              {event.storage_type === "google_drive" ? "Stored in Google Drive" : "Stored in Cloudflare R2"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              AI Face Recognition
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">{facesIndexed}</p>
                <p className="text-xs text-muted-foreground">Photos indexed</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalFaces}</p>
                <p className="text-xs text-muted-foreground">Faces detected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
