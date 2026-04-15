"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X } from "lucide-react";

type Props = {
  eventId: string;
  hasPhotos: boolean;
  hasCover: boolean;
  isPublished: boolean;
  hasGuests: boolean;
};

type ChecklistItem = {
  key: string;
  label: string;
  description: string;
  done: boolean;
};

export function EventChecklist({ eventId, hasPhotos, hasCover, isPublished, hasGuests }: Props) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const storageKey = `checklist-dismissed-${eventId}`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDismissed(localStorage.getItem(storageKey) === "true");
    }
  }, [storageKey]);

  const items: ChecklistItem[] = [
    {
      key: "created",
      label: "Create event",
      description: "Your event is set up and ready.",
      done: true,
    },
    {
      key: "cover",
      label: "Add a cover photo",
      description: "Give your gallery a beautiful first impression.",
      done: hasCover,
    },
    {
      key: "photos",
      label: "Upload photos",
      description: "Add photos so guests can start finding themselves.",
      done: hasPhotos,
    },
    {
      key: "publish",
      label: "Publish the event",
      description: "Make the gallery live so guests can access it.",
      done: isPublished,
    },
    {
      key: "share",
      label: "Share with guests",
      description: "Send the link or QR code to your guests.",
      done: hasGuests,
    },
  ];

  const completedCount = items.filter((i) => i.done).length;
  const allDone = completedCount === items.length;

  function handleDismiss() {
    localStorage.setItem(storageKey, "true");
    setDismissed(true);
  }

  // Don't show if dismissed or all done
  if (dismissed || allDone) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between bg-primary px-4 py-3 text-primary-foreground"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-semibold">
            Setup Checklist
          </span>
          <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs font-bold">
            {completedCount}/{items.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-1 bg-primary/20">
        <div
          className="h-1 bg-primary transition-all duration-500"
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>

      {/* Items */}
      {open && (
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div key={item.key} className="flex items-start gap-3 px-4 py-3">
              {item.done ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
              )}
              <div>
                <p
                  className={`text-sm font-medium ${
                    item.done ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {item.label}
                </p>
                {!item.done && (
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
            </div>
          ))}

          {/* Dismiss */}
          <div className="px-4 py-3">
            <button
              onClick={handleDismiss}
              className="flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Dismiss checklist
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
