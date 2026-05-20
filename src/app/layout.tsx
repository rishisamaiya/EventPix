import type { Metadata } from "next";
import "./globals.css";
import { Chatbot } from "@/components/chatbot";
import Script from "next/script";

export const metadata: Metadata = {
  title: "EventPix — AI Photo Sharing for Events",
  description:
    "Share event photos and find yours instantly with AI face recognition. Connect Google Drive, share via WhatsApp, and let guests find their photos with a selfie.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EventPix",
  },
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
        <Chatbot />
        <Script id="register-sw" strategy="lazyOnload">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  console.log('ServiceWorker registered successfully with scope:', reg.scope);
                }).catch(function(err) {
                  console.log('ServiceWorker registration failed:', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
