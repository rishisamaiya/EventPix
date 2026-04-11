"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

export function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `Check out the event photos! Find your photos with a selfie: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-secondary"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {copied ? "Copied!" : "Copy Link"}
      </button>
      <button
        onClick={shareWhatsApp}
        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
      >
        <Share2 className="h-4 w-4" />
        WhatsApp
      </button>
    </div>
  );
}
