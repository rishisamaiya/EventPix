"use client";

import { useState } from "react";
import { updateTicket } from "./actions";
import { MessageCircle, Clock, CheckCircle2, AlertCircle, Mail, User, Send, Save, ExternalLink } from "lucide-react";

export function TicketCard({ ticket }: { ticket: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState(ticket.status);
  const [reply, setReply] = useState(ticket.admin_reply || "");
  const [isSaving, setIsSaving] = useState(false);

  function statusBadge(s: string) {
    const map: Record<string, string> = {
      open: "bg-blue-100 text-blue-700",
      in_progress: "bg-yellow-100 text-yellow-700",
      resolved: "bg-green-100 text-green-700",
      closed: "bg-gray-100 text-gray-500",
    };
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[s] ?? "bg-gray-100 text-gray-600"}`}>
        {s.replace("_", " ")}
      </span>
    );
  }

  function statusIcon(s: string) {
    switch (s) {
      case "open": return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "in_progress": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "resolved": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <MessageCircle className="h-4 w-4 text-gray-400" />;
    }
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      await updateTicket(ticket.id, status, reply);
      setIsExpanded(false);
    } catch (e) {
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-5 hover:bg-muted/10 transition-colors border-b border-border last:border-0 relative">
      <div 
        className="flex items-start justify-between gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="mt-0.5">{statusIcon(ticket.status)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              {ticket.subject}
              {statusBadge(ticket.status)}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> {ticket.name}</span>
              <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {ticket.email}</span>
              <span>
                {new Date(ticket.created_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </span>
            </div>
            {!isExpanded && ticket.admin_reply && (
              <p className="mt-2 text-xs font-semibold text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Reply saved
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="ml-7 mt-3 rounded-xl bg-muted/20 p-4 text-sm text-foreground leading-relaxed border border-border/50">
        <p className="whitespace-pre-wrap">{ticket.message}</p>
      </div>

      {isExpanded && (
        <div className="ml-7 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              Respond to Ticket
            </h4>
            
            <div className="flex items-center gap-3 mb-4">
              <a 
                href={`mailto:${ticket.email}?subject=Re: ${encodeURIComponent(ticket.subject)}`}
                className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 hover:text-blue-800"
              >
                <Send className="h-3.5 w-3.5" /> Email Customer Directly
              </a>
              <span className="text-xs text-muted-foreground">(Opens your mail app)</span>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Action Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full sm:w-64 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              >
                <option value="open">Open (Needs review)</option>
                <option value="in_progress">In Progress (Working on it)</option>
                <option value="resolved">Resolved (Done)</option>
                <option value="closed">Closed (Won't fix/Spam)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Internal Notes / Saved Reply</label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Save notes here so you remember what you told them..."
                className="w-full min-h-[100px] rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-y"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
              <button 
                onClick={() => setIsExpanded(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
