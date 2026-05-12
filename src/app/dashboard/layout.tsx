import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Camera,
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  MessageCircle,
  LogOut,
  Menu,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "rishi.samaiya@gmail.com";

const NAV_ITEMS = [
  { href: "/dashboard",         icon: LayoutDashboard, label: "Events"   },
  { href: "/dashboard/billing", icon: CreditCard,       label: "Billing"  },
  { href: "/help",              icon: HelpCircle,        label: "Help"     },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isAdmin = user.email === ADMIN_EMAIL;

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Left Sidebar ── */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 bg-white z-40">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-5 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-sky-400 shadow-md shadow-blue-200">
            <Camera className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">EventPix</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-all hover:bg-blue-50 hover:text-blue-700"
            >
              <Icon className="h-4 w-4 flex-shrink-0 transition group-hover:text-blue-600" />
              {label}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="mt-3 mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-300">
                Admin
              </div>
              <Link
                href="/dashboard/admin"
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-violet-500 transition-all hover:bg-violet-50 hover:text-violet-700"
              >
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                Admin Panel
              </Link>
              <Link
                href="/dashboard/admin/tickets"
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-amber-500 transition-all hover:bg-amber-50 hover:text-amber-700"
              >
                <MessageCircle className="h-4 w-4 flex-shrink-0" />
                Support Tickets
              </Link>
            </>
          )}
        </nav>

        {/* User info + logout at bottom */}
        <div className="border-t border-slate-100 p-3">
          <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
            <p className="truncate text-xs font-medium text-slate-700">{user.email}</p>
            <p className="text-[10px] text-slate-400">Host account</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-sky-400">
            <Camera className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900">EventPix</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/billing" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <CreditCard className="h-4 w-4" />
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 md:ml-56">
        <main className="min-h-screen px-4 py-6 md:px-8 md:py-8 pt-20 md:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
