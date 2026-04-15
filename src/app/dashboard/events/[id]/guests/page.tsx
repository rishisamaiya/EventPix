import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, ScanFace, Clock, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EventTabs } from "@/components/event-tabs";

export default async function EventGuestsPage({
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
    .select("id, name, event_type")
    .eq("id", id)
    .eq("host_id", user.id)
    .single();

  if (!event) notFound();

  const { data: sessions } = await supabase
    .from("guest_sessions")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  const totalVisits = sessions?.length ?? 0;
  const withSelfie = sessions?.filter((s) => s.selfie_embedding !== null).length ?? 0;
  const withMatches = sessions?.filter((s) => (s.matched_photo_count ?? 0) > 0).length ?? 0;

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
        <p className="text-sm text-muted-foreground">Guest List</p>
      </div>

      <EventTabs eventId={id} />

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { icon: <Users className="h-5 w-5 text-blue-500" />, label: "Total Visits", value: totalVisits, bg: "bg-blue-50" },
          { icon: <ScanFace className="h-5 w-5 text-purple-500" />, label: "Selfie Searches", value: withSelfie, bg: "bg-purple-50" },
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

      {/* Guest Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {!sessions || sessions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="font-medium text-muted-foreground">No guest visits yet</p>
            <p className="text-sm text-muted-foreground">
              Guest visits will appear here once you share the event link.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-muted-foreground">Guest</th>
                <th className="px-6 py-3 text-left font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Visit Time</div>
                </th>
                <th className="px-6 py-3 text-left font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1"><ScanFace className="h-3.5 w-3.5" /> Selfie</div>
                </th>
                <th className="px-6 py-3 text-left font-semibold text-muted-foreground">Photos Found</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sessions.map((session: any) => (
                <tr key={session.id} className="hover:bg-muted/20">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {session.guest_name ? session.guest_name[0].toUpperCase() : "?"}
                      </div>
                      <span className="font-medium">
                        {session.guest_name || <span className="italic text-muted-foreground">Anonymous</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {new Date(session.created_at).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-3">
                    {session.selfie_embedding ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        <ScanFace className="h-3 w-3" /> Yes
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">No selfie</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {session.matched_photo_count > 0 ? (
                      <span className="font-semibold text-green-600">{session.matched_photo_count} photos</span>
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
