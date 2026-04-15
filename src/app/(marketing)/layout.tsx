import Link from "next/link";
import { Camera } from "lucide-react";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07080f]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#07080f]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">EventPix</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-white/50 transition hover:text-white">
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-600 hover:to-purple-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 text-white">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <span className="font-extrabold text-white">EventPix</span>
              </div>
              <p className="text-sm text-white/30 leading-relaxed">
                AI-powered photo sharing for events. Built for moments that matter.
              </p>
            </div>

            {[
              { title: "Product", links: [["/#features","Features"],["/#pricing","Pricing"],["/#how-it-works","How It Works"],["/docs","Documentation"]] },
              { title: "Support", links: [["/help","Help Center"],["/contact","Contact Us"],["/docs","Getting Started"]] },
              { title: "Legal",   links: [["/privacy","Privacy Policy"],["/terms","Terms of Service"],["/refund","Refund Policy"]] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="mb-4 text-sm font-semibold text-white/50">{title}</h4>
                <ul className="space-y-3 text-sm">
                  {links.map(([href, label]) => (
                    <li key={href}>
                      <Link href={href} className="text-white/30 transition hover:text-white/70">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-white/5 pt-8 text-center text-sm text-white/20">
            © {new Date().getFullYear()} EventPix · All rights reserved · Made with ❤️ in India
          </div>
        </div>
      </footer>
    </div>
  );
}
