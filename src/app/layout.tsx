import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventPix — AI Photo Sharing for Events",
  description:
    "Share event photos and find yours instantly with AI face recognition. Connect Google Drive, share via WhatsApp, and let guests find their photos with a selfie.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
