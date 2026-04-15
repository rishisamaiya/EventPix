import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MessageCircle, Clock, CheckCircle2, AlertCircle,
  Mail, User, FileText,
} from "lucide-react";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "rishi.samaiya@gmail.com";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        map[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function statusIcon(status: string) {
  switch (status) {
    case "open":
      return <AlertCircle className="h-4 w-4 text-blue-500" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "resolved":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    default:
      return <MessageCircle className="h-4 w-4 text-gray-400" />;
  }
}

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
              <div key={ticket.id} className="p-5 hover:bg-muted/20">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {statusIcon(ticket.status)}
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {ticket.subject}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ticket.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {ticket.email}
                        </span>
                        <span>
                          {new Date(ticket.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  {statusBadge(ticket.status)}
                </div>
                <div className="ml-7 rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                  {ticket.message}
                </div>
                {ticket.admin_reply && (
                  <div className="ml-7 mt-2 rounded-lg border border-green-100 bg-green-50 p-3 text-sm text-green-800">
                    <p className="mb-1 text-xs font-semibold text-green-600">
                      Admin Reply:
                    </p>
                    {ticket.admin_reply}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
