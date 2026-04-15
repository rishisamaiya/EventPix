import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EventSettingsForm } from "./event-settings-form";

export default async function EventSettingsPage({
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

  return (
    <div>
      {/* Back to event (main page with tabs) */}
      <Link
        href={`/dashboard/events/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        ← Back to {event.name}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Event Settings</h1>
        <p className="text-sm text-muted-foreground capitalize">
          {event.event_type && event.event_type !== "other" ? `${event.event_type} · ` : ""}
          {event.name}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8">
        <EventSettingsForm event={event} />
      </div>
    </div>
  );
}
