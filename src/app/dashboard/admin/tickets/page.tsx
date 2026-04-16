import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AlertCircle, CheckCircle2, Clock, MessageCircle } from "lucide-react";
import { TicketCard } from "./ticket-card";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "rishi.samaiya@gmail.com";



export default async function AdminTicketsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.email !== ADMIN_EMAIL) redirect("/dashboard");

  const admin = createAdminClient();

  const { data: tickets } = await admin
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  const openCount = tickets?.filter((t: any) => t.status === "open").length ?? 0;
  const inProgressCount =
    tickets?.filter((t: any) => t.status === "in_progress").length ?? 0;
  const resolvedCount =
    tickets?.filter((t: any) => t.status === "resolved").length ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <p className="text-sm text-muted-foreground">
          Manage customer support requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white">
            <AlertCircle className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">{openCount}</p>
          <p className="text-sm text-muted-foreground">Open</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500 text-white">
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">{inProgressCount}</p>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 text-white">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">{resolvedCount}</p>
          <p className="text-sm text-muted-foreground">Resolved</p>
        </div>
      </div>

      {/* Tickets List */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {!tickets || tickets.length === 0 ? (
          <div className="px-6 py-16 text-center text-muted-foreground">
            <MessageCircle className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-medium">No support tickets yet</p>
            <p className="text-sm">
              Tickets from the contact form will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tickets.map((ticket: any) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
