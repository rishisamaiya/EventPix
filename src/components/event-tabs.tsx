import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  eventId: string;
  guestCount?: number;
};

// Simple back link - tabs (Overview/Guests/Analytics) are now
// client-side buttons on the main event page, not separate routes
export function EventTabs({ eventId }: Props) {
  return (
    <div className="mb-6">
      <Link
        href={`/dashboard/events/${eventId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Event
      </Link>
    </div>
  );
}
