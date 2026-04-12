import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Users, ImageIcon, HardDrive, TrendingUp, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";

// Only allow the designated admin email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "rishjain@gmail.com";

type EventRow = {
  id: string;
  name: string;
  status: string;
  storage_type: string;
  photo_count: number;
  guest_count: number;
  created_at: string;
  expires_at: string | null;
  host_id: string;
  host_email?: string;
};

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium text-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active:  "bg-green-100 text-green-700",
    draft:   "bg-yellow-100 text-yellow-700",
    expired: "bg-red-100 text-red-700",
    deleted: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function daysLeft(expiresAt: string | null, createdAt: string): number {
  const expiry = expiresAt ? new Date(expiresAt) : new Date(new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
  return Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Guard: only admin email can access
  if (user.email !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const admin = createAdminClient();

  // Fetch all events
  const { data: events } = await admin
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch all auth users
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers();

  const userMap = new Map(authUsers.map((u) => [u.id, u.email ?? "unknown"]));

  const enriched: EventRow[] = (events ?? []).map((e) => ({
    ...e,
    host_email: userMap.get(e.host_id) ?? "unknown",
  }));

  // Stats
  const totalUsers = authUsers.length;
  const totalEvents = enriched.length;
  const activeEvents = enriched.filter((e) => e.status === "active").length;
  const totalPhotos = enriched.reduce((s, e) => s + (e.photo_count ?? 0), 0);
  const r2Events = enriched.filter((e) => e.storage_type === "cloudflare_r2").length;
  const driveEvents = enriched.filter((e) => e.storage_type === "google_drive").length;

  // Group events by user
  const byUser = new Map<string, EventRow[]>();
  for (const e of enriched) {
    if (!byUser.has(e.host_id)) byUser.set(e.host_id, []);
    byUser.get(e.host_id)!.push(e);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Super Admin</h1>
        <p className="text-sm text-muted-foreground">Platform overview · all customers · all events</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5 text-white"/>}  label="Total Users"   value={totalUsers}   color="bg-blue-500"    />
        <StatCard icon={<Calendar className="h-5 w-5 text-white"/>} label="Total Events" value={totalEvents}  sub={`${activeEvents} active`} color="bg-violet-500" />
        <StatCard icon={<ImageIcon className="h-5 w-5 text-white"/>} label="Total Photos" value={totalPhotos.toLocaleString()} color="bg-emerald-500" />
        <StatCard icon={<HardDrive className="h-5 w-5 text-white"/>} label="R2 Events"   value={r2Events}     sub={`${driveEvents} on Drive`} color="bg-orange-500" />
      </div>

      {/* Per-user breakdown */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Customers ({byUser.size})</h2>
        <div className="space-y-4">
          {Array.from(byUser.entries()).map(([hostId, userEvents]) => {
            const email = userMap.get(hostId) ?? "unknown";
            const photos = userEvents.reduce((s, e) => s + (e.photo_count ?? 0), 0);
            return (
              <div key={hostId} className="rounded-2xl border border-border bg-card overflow-hidden">
                {/* User header */}
                <div className="flex items-center justify-between gap-4 border-b border-border bg-muted/30 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {email[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{email}</p>
                      <p className="text-xs text-muted-foreground">{userEvents.length} event{userEvents.length !== 1 ? "s" : ""} · {photos} photos</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Joined {new Date(userEvents[userEvents.length - 1].created_at).toLocaleDateString("en-IN")}
                  </div>
                </div>

                {/* Events table */}
                <div className="divide-y divide-border">
                  {userEvents.map((ev) => {
                    const days = daysLeft(ev.expires_at, ev.created_at);
                    return (
                      <div key={ev.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-3 text-sm">
                        <div className="min-w-0 flex-1">
                          <span className="font-medium">{ev.name}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {statusBadge(ev.status)}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ImageIcon className="h-3.5 w-3.5"/> {ev.photo_count ?? 0} photos
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <HardDrive className="h-3.5 w-3.5"/> {ev.storage_type?.replace("_", " ")}
                          </span>
                          <span className={`flex items-center gap-1 text-xs font-medium ${
                            days > 7 ? "text-green-600" : days > 0 ? "text-amber-600" : "text-red-500"
                          }`}>
                            <Clock className="h-3.5 w-3.5"/> {days > 0 ? `${days}d left` : "Expired"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(ev.created_at).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent signups */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">All Signups ({authUsers.length})</h2>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Email</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Signed Up</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Events</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Photos</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {authUsers.map((u) => {
                const userEvs = byUser.get(u.id) ?? [];
                const photos = userEvs.reduce((s, e) => s + (e.photo_count ?? 0), 0);
                return (
                  <tr key={u.id} className="hover:bg-muted/20">
                    <td className="px-5 py-3 font-medium">{u.email}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                    </td>
                    <td className="px-5 py-3">{userEvs.length}</td>
                    <td className="px-5 py-3">{photos}</td>
                    <td className="px-5 py-3">
                      {u.email_confirmed_at
                        ? <CheckCircle2 className="h-4 w-4 text-green-500"/>
                        : <XCircle className="h-4 w-4 text-red-400"/>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
