import Link from "next/link";
import {
  Camera,
  Share2,
  Lock,
  ScanFace,
  ArrowRight,
  Check,
  X,
  Download,
  Zap,
  Shield,
  Users,
  Image,
  QrCode,
  Smartphone,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDF2F8] text-[#1a0a12]">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-pink-100 bg-[#FDF2F8]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-600">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-pink-900">EventPix</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-pink-800/70 transition hover:text-pink-900">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-pink-800/70 transition hover:text-pink-900">How It Works</Link>
            <Link href="#pricing" className="text-sm font-medium text-pink-800/70 transition hover:text-pink-900">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-pink-800 transition hover:bg-pink-100">
              Login
            </Link>
            <Link href="/signup" className="rounded-xl bg-pink-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-700">
              Try for free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-[#FDF2F8] to-rose-50" />
        <div className="absolute -right-64 -top-64 h-[600px] w-[600px] rounded-full bg-pink-200/30 blur-3xl" />
        <div className="absolute -left-32 top-32 h-[400px] w-[400px] rounded-full bg-rose-200/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-pink-700 shadow-sm">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Powered by AWS Rekognition AI
          </div>

          <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-bold leading-tight tracking-tight text-pink-950 sm:text-6xl lg:text-7xl">
            AI Photo Sharing
            <br />
            <span className="text-pink-600">for Every Event</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-pink-800/70 sm:text-xl">
            Guests take one selfie and instantly find every photo they appear in.
            No app download, no scrolling — magic delivered via WhatsApp.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-pink-200 transition hover:bg-pink-700"
            >
              Create Free Event
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-pink-200 bg-white px-8 py-3.5 text-base font-semibold text-pink-800 transition hover:bg-pink-50"
            >
              See How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: "99%", label: "Face Match Accuracy" },
              { value: "< 1s", label: "Search Speed" },
              { value: "10GB", label: "Free Storage" },
              { value: "₹0", label: "To Get Started" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-pink-100 bg-white/80 p-4 shadow-sm">
                <div className="text-2xl font-bold text-pink-600">{stat.value}</div>
                <div className="mt-1 text-xs font-medium text-pink-800/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-pink-500">Simple Process</p>
            <h2 className="mb-4 text-3xl font-bold text-pink-950 sm:text-4xl">
              Up and running in minutes
            </h2>
            <p className="mx-auto max-w-xl text-lg text-pink-800/60">
              From connecting your photos to guests finding themselves — three steps, zero complexity.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: <Image className="h-6 w-6" />,
                title: "Connect Your Photos",
                description: "Link Google Drive or upload directly. Our AI indexes every face automatically — you don't lift a finger.",
                color: "bg-pink-600",
              },
              {
                step: "02",
                icon: <Share2 className="h-6 w-6" />,
                title: "Share via WhatsApp",
                description: "Send a link or QR code. Guests open it directly in their browser — no app download, no sign-up required.",
                color: "bg-rose-500",
              },
              {
                step: "03",
                icon: <ScanFace className="h-6 w-6" />,
                title: "Selfie Finds Photos",
                description: "Guests take one selfie and instantly see every photo they appear in. Download in one tap.",
                color: "bg-pink-700",
              },
            ].map((item) => (
              <div key={item.step} className="group relative cursor-default rounded-2xl border border-pink-100 bg-white p-8 shadow-sm transition hover:shadow-md hover:shadow-pink-100">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-pink-300">Step {item.step}</div>
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${item.color} text-white shadow-lg`}>
                  {item.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-pink-950">{item.title}</h3>
                <p className="leading-relaxed text-pink-800/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y border-pink-100 bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-pink-500">Features</p>
            <h2 className="mb-4 text-3xl font-bold text-pink-950 sm:text-4xl">Everything your event needs</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <ScanFace className="h-5 w-5" />,
                title: "AWS Rekognition AI",
                description: "Same face recognition used by Amazon Photos. 99%+ accuracy across group photos, candids, and low light.",
                badge: "Production Grade",
              },
              {
                icon: <Zap className="h-5 w-5" />,
                title: "Results in Under 1 Second",
                description: "Guests get their photos instantly. No 30-second model loading — results before they lower their phone.",
                badge: null,
              },
              {
                icon: <Share2 className="h-5 w-5" />,
                title: "WhatsApp Sharing",
                description: "Share event links directly to WhatsApp groups. Works perfectly on mobile — no friction for guests.",
                badge: null,
              },
              {
                icon: <Camera className="h-5 w-5" />,
                title: "Google Drive BYOC",
                description: "Photos stay in your Google Drive. No upload limits, no storage costs. We just index the faces.",
                badge: "Free Forever",
              },
              {
                icon: <Lock className="h-5 w-5" />,
                title: "PIN Protection",
                description: "Keep your event private with a 4-6 digit PIN. Only invited guests can access the gallery.",
                badge: null,
              },
              {
                icon: <QrCode className="h-5 w-5" />,
                title: "QR Code Access",
                description: "Generate a QR code for your event. Print it at the venue — guests scan and find their photos instantly.",
                badge: null,
              },
              {
                icon: <Download className="h-5 w-5" />,
                title: "One-Tap Download",
                description: "Guests can download their photos in full resolution directly from the gallery, no account needed.",
                badge: null,
              },
              {
                icon: <Shield className="h-5 w-5" />,
                title: "Cloudflare Storage",
                description: "Photos stored on Cloudflare R2. 10GB free, zero egress fees — your guests download at no cost to you.",
                badge: "10GB Free",
              },
              {
                icon: <Smartphone className="h-5 w-5" />,
                title: "Mobile First",
                description: "Designed for phones. Works perfectly on iOS and Android browsers — no app install ever required.",
                badge: null,
              },
            ].map((feature) => (
              <div key={feature.title} className="group cursor-default rounded-xl border border-pink-100 bg-[#FDF2F8] p-6 transition hover:border-pink-200 hover:shadow-sm">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-600 text-white">
                    {feature.icon}
                  </div>
                  {feature.badge && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="mb-1.5 font-semibold text-pink-950">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-pink-800/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-pink-500">Comparison</p>
            <h2 className="text-3xl font-bold text-pink-950 sm:text-4xl">EventPix vs Other Platforms</h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm">
            <div className="grid grid-cols-3 border-b border-pink-100 bg-pink-50/50">
              <div className="p-5 text-sm font-semibold text-pink-400">Feature</div>
              <div className="border-x border-pink-100 p-5 text-center text-sm font-semibold text-pink-400">Others</div>
              <div className="bg-pink-600 p-5 text-center text-sm font-bold text-white">EventPix</div>
            </div>
            {[
              ["Production-grade face recognition", false, true],
              ["Results in under 1 second", false, true],
              ["Google Drive (no upload needed)", false, true],
              ["Free to start, no credit card", false, true],
              ["Works on all mobile browsers", true, true],
              ["WhatsApp sharing", true, true],
              ["PIN-protected galleries", true, true],
              ["Cloudflare CDN delivery", false, true],
            ].map(([feature, others, eventpix], i) => (
              <div
                key={String(feature)}
                className={`grid grid-cols-3 border-b border-pink-50 ${i % 2 === 0 ? "bg-white" : "bg-pink-50/30"}`}
              >
                <div className="p-4 text-sm font-medium text-pink-900">{String(feature)}</div>
                <div className="flex items-center justify-center border-x border-pink-100 p-4">
                  {others ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-pink-200" />
                  )}
                </div>
                <div className="flex items-center justify-center bg-pink-50/50 p-4">
                  {eventpix ? (
                    <Check className="h-5 w-5 text-pink-600" />
                  ) : (
                    <X className="h-5 w-5 text-pink-200" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-pink-100 bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-pink-500">Pricing</p>
            <h2 className="mb-4 text-3xl font-bold text-pink-950 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-pink-800/60">Start free. Upgrade when you need more storage.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Free */}
            <div className="rounded-2xl border border-pink-100 bg-[#FDF2F8] p-8">
              <div className="mb-6">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-pink-400">Free Event</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-pink-950">₹0</span>
                </div>
                <p className="mt-2 text-sm text-pink-700/60">No credit card required</p>
              </div>
              <Link
                href="/signup"
                className="mb-8 block w-full rounded-xl border border-pink-200 bg-white py-3 text-center text-sm font-semibold text-pink-700 transition hover:bg-pink-50"
              >
                Get Started Free
              </Link>
              <ul className="space-y-3">
                {[
                  "Google Drive (unlimited photos)",
                  "1 active event",
                  "50 guests",
                  "Face recognition (AWS)",
                  "WhatsApp sharing",
                  "PIN protection",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-pink-800/70">
                    <Check className="h-4 w-4 flex-shrink-0 text-pink-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Starter */}
            <div className="relative rounded-2xl border-2 border-pink-600 bg-white p-8 shadow-xl shadow-pink-100">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-pink-600 px-4 py-1 text-xs font-bold text-white">
                MOST POPULAR
              </div>
              <div className="mb-6">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-pink-500">Starter Event</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-pink-950">₹1,499</span>
                </div>
                <p className="mt-2 text-sm text-pink-700/60">per event · 1 year validity</p>
              </div>
              <Link
                href="/signup"
                className="mb-8 block w-full rounded-xl bg-pink-600 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-700"
              >
                Get Started
              </Link>
              <ul className="space-y-3">
                {[
                  "25 GB storage on Cloudflare R2",
                  "1 event",
                  "500 guests",
                  "Face recognition (AWS)",
                  "Google Drive BYOC",
                  "WhatsApp + QR sharing",
                  "Download control",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-pink-800/70">
                    <Check className="h-4 w-4 flex-shrink-0 text-pink-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border border-pink-100 bg-[#FDF2F8] p-8">
              <div className="mb-6">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-pink-400">Pro Event</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-pink-950">₹3,499</span>
                </div>
                <p className="mt-2 text-sm text-pink-700/60">per event · 1 year validity</p>
              </div>
              <Link
                href="/signup"
                className="mb-8 block w-full rounded-xl border border-pink-200 bg-white py-3 text-center text-sm font-semibold text-pink-700 transition hover:bg-pink-50"
              >
                Get Started
              </Link>
              <ul className="space-y-3">
                {[
                  "100 GB storage on Cloudflare R2",
                  "Unlimited events",
                  "Unlimited guests",
                  "Face recognition (AWS)",
                  "Google Drive BYOC",
                  "WhatsApp + QR sharing",
                  "Download control",
                  "Dedicated support",
                  "Custom branding",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-pink-800/70">
                    <Check className="h-4 w-4 flex-shrink-0 text-pink-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-pink-700/50">
            All plans include AWS Rekognition face search · Cloudflare CDN delivery · Zero egress fees
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="rounded-3xl bg-gradient-to-br from-pink-600 to-rose-600 p-12 shadow-2xl shadow-pink-200">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Ready to wow your guests?
            </h2>
            <p className="mb-8 text-lg text-pink-100">
              Create your first event free. No credit card. No downloads.
              <br />
              Just photos, found instantly.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-pink-600 shadow-lg transition hover:bg-pink-50"
            >
              Create Free Event
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pink-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-pink-900">EventPix</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-pink-700/50">
              <Link href="#features" className="transition hover:text-pink-700">Features</Link>
              <Link href="#pricing" className="transition hover:text-pink-700">Pricing</Link>
              <Link href="/login" className="transition hover:text-pink-700">Login</Link>
              <Link href="/signup" className="transition hover:text-pink-700">Sign Up</Link>
            </div>
            <p className="text-sm text-pink-700/40">
              &copy; {new Date().getFullYear()} EventPix · Built for moments that matter
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
