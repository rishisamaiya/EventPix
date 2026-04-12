import Link from "next/link";
import { Plus, Calendar, ImageIcon, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("host_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Events</h1>
          <p className="text-muted-foreground">
            Create and manage your photo sharing events.
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Event
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No events yet</h3>
          <p className="mb-6 max-w-sm text-center text-muted-foreground">
            Create your first event to start sharing photos with your guests.
          </p>
          <Link
            href="/dashboard/events/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="group rounded-xl border border-border bg-card p-6 transition hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              {event.cover_url ? (
                <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-muted">
                  <img
                    src={event.cover_url}
                    alt={event.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="mb-4 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent">
                  <Calendar className="h-10 w-10 text-primary/50" />
                </div>
              )}
              <h3 className="mb-1 font-semibold group-hover:text-primary">
                {event.name}
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">
                {event.event_date
                  ? new Date(event.event_date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Date not set"}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {event.photo_count ?? 0} photos
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {event.guest_count ?? 0} guests
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
