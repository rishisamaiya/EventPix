import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings, ImageIcon, Users, BarChart2 } from "lucide-react";
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

  const tabs = [
    { label: "Overview", href: `/dashboard/events/${id}`, icon: <ImageIcon className="h-4 w-4" /> },
    { label: "Settings", href: `/dashboard/events/${id}/settings`, icon: <Settings className="h-4 w-4" />, active: true },
    { label: "Guests", href: `/dashboard/events/${id}/guests`, icon: <Users className="h-4 w-4" /> },
    { label: "Analytics", href: `/dashboard/events/${id}/analytics`, icon: <BarChart2 className="h-4 w-4" /> },
  ];

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

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab.active
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Settings Form */}
      <div className="rounded-2xl border border-border bg-card p-8">
        <EventSettingsForm event={event} />
      </div>
    </div>
  );
}
