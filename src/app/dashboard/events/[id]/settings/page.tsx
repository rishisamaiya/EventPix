import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EventSettingsForm } from "./event-settings-form";
import { EventTabs } from "@/components/event-tabs";

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
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <p className="text-sm text-muted-foreground">{event.event_type ? `${event.event_type} · ` : ""}Settings</p>
      </div>

      <EventTabs eventId={id} />

      {/* Settings Form */}
      <div className="rounded-2xl border border-border bg-card p-8">
        <EventSettingsForm event={event} />
      </div>
    </div>
  );
}
