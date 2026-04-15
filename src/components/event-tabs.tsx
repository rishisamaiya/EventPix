"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ImageIcon, Settings, Users, BarChart2 } from "lucide-react";

type Props = {
  eventId: string;
  guestCount?: number;
};

export function EventTabs({ eventId, guestCount = 0 }: Props) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Overview",
      href: `/dashboard/events/${eventId}`,
      icon: <ImageIcon className="h-4 w-4" />,
      exact: true,
    },
    {
      label: "Settings",
      href: `/dashboard/events/${eventId}/settings`,
      icon: <Settings className="h-4 w-4" />,
    },
    {
      label: "Guests",
      href: `/dashboard/events/${eventId}/guests`,
      icon: <Users className="h-4 w-4" />,
      count: guestCount,
    },
    {
      label: "Analytics",
      href: `/dashboard/events/${eventId}/analytics`,
      icon: <BarChart2 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                {tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
