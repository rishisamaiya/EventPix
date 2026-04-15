import Link from "next/link";
import { Camera } from "lucide-react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F8FF]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-blue-100/80 bg-[#F5F8FF]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 shadow-lg shadow-blue-200">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              EventPix
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-blue-50"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-sky-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-200/60 transition hover:from-blue-600 hover:to-sky-500"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">{children}</main>

      {/* Footer */}
      <footer className="border-t border-blue-100 bg-[#F5F8FF] py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-400">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <span className="font-extrabold text-slate-800">EventPix</span>
              </div>
              <p className="text-sm text-slate-400">
                AI-powered photo sharing for events. Built for moments that
                matter.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-700">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                {[
                  ["/#features", "Features"],
                  ["/#pricing", "Pricing"],
                  ["/#how-it-works", "How It Works"],
                  ["/docs", "Documentation"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="transition hover:text-slate-700">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-700">
                Support
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                {[
                  ["/help", "Help Center"],
                  ["/contact", "Contact Us"],
                  ["/docs", "Getting Started"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="transition hover:text-slate-700">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-700">
                Legal
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                {[
                  ["/privacy", "Privacy Policy"],
                  ["/terms", "Terms of Service"],
                  ["/refund", "Refund Policy"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="transition hover:text-slate-700">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-blue-100 pt-6 text-center text-sm text-slate-300">
            &copy; {new Date().getFullYear()} EventPix · All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
