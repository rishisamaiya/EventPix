import Link from "next/link";
import Image from "next/image";
import {
  Camera, Share2, Lock, ScanFace, ArrowRight, Check, X,
  Download, Zap, Shield, QrCode, Smartphone, Image as ImageIcon,
  Star, Users, Globe, ChevronRight,
} from "lucide-react";
import { PricingSection } from "@/components/pricing-section";
import { AuthErrorHandler } from "@/components/auth-error-handler";

const GRID_PHOTOS = [
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=100&h=100&fit=crop&q=60",
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=100&h=100&fit=crop&q=60",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=100&h=100&fit=crop&q=60",
  "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=100&h=100&fit=crop&q=60",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=100&h=100&fit=crop&q=60",
  "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=100&h=100&fit=crop&q=60",
  "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?w=100&h=100&fit=crop&q=60",
  "https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=100&h=100&fit=crop&q=60",
  "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=100&h=100&fit=crop&q=60",
];

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-60 animate-float-slow">
      {/* glow behind phone */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-violet-500/20 blur-3xl scale-110" />
      <div className="relative rounded-[2.5rem] border-[5px] border-white/10 bg-slate-900 shadow-[0_40px_100px_-20px_rgba(139,92,246,0.5)] overflow-hidden">
        <div className="relative z-10 mx-auto mt-2 h-5 w-24 rounded-full bg-slate-900" />
        <div className="h-[500px] w-full overflow-hidden bg-[#0f1117]">
          {/* status bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#0f1117]">
            <span className="text-[9px] font-bold text-white/70">9:41</span>
            <span className="text-[9px] font-semibold text-violet-400">EventPix</span>
            <div className="flex gap-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400/60" />
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400/30" />
            </div>
          </div>
          {/* app header */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-4 text-white">
            <p className="text-[10px] font-medium opacity-70 uppercase tracking-widest">Anurag Wedding</p>
            <p className="text-sm font-bold mt-0.5">89 Photos ✨</p>
            <button className="mt-2 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold backdrop-blur border border-white/20">
              <ScanFace className="h-3 w-3" /> Find MY photos
            </button>
          </div>
          {/* selfie result bar */}
          <div className="mx-3 mt-2 mb-2 rounded-xl bg-violet-500/20 border border-violet-500/30 p-2.5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <ScanFace className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-white">11 photos found!</p>
                <p className="text-[8px] text-violet-300">Matched via AI · &lt;1s</p>
              </div>
              <Check className="ml-auto h-4 w-4 text-emerald-400" />
            </div>
          </div>
          {/* photo grid */}
          <div className="grid grid-cols-3 gap-px p-px">
            {GRID_PHOTOS.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden">
                <Image src={src} alt="" fill className="object-cover" unoptimized />
                {[0, 3, 6].includes(i) && (
                  <div className="absolute inset-0 border-2 border-violet-400 shadow-[inset_0_0_8px_rgba(167,139,250,0.5)]">
                    <div className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-violet-500 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, badge, gradient }: {
  icon: React.ReactNode; title: string; desc: string; badge?: string; gradient: string;
}) {
  return (
    <div className="card-hover glass-dark rounded-2xl p-6 cursor-default">
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
        {badge && (
          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-400">
            {badge}
          </span>
        )}
      </div>
      <h3 className="mb-2 font-bold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-white/50">{desc}</p>
    </div>
  );
}

function TestimonialCard({ name, role, text, rating }: { name: string; role: string; text: string; rating: number }) {
  return (
    <div className="glass-dark card-hover rounded-2xl p-6">
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="mb-4 text-sm leading-relaxed text-white/70">&ldquo;{text}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-xs text-white/40">{role}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07080f]">
      <AuthErrorHandler />

      {/* ── Navbar ── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#07080f]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">EventPix</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {[["#features","Features"],["#how-it-works","How It Works"],["#pricing","Pricing"],["/help","Help"]].map(([h,l]) => (
              <Link key={h} href={h} className="text-sm font-medium text-white/50 transition hover:text-white">{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 transition hover:text-white">
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-600 hover:to-purple-700"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen overflow-hidden pt-16 flex items-center">
        {/* Background orbs */}
        <div className="animate-orb pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-600/15 blur-3xl" />
        <div className="animate-orb delay-1000 pointer-events-none absolute top-1/2 -left-60 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="animate-orb delay-500 pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl" />

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-16 px-4 py-20 md:grid-cols-2 md:py-28">
          {/* left */}
          <div className="animate-slide-up text-center md:text-left">
            {/* badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Powered by AWS Rekognition AI
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Every Guest.
              <br />
              <span className="gradient-text-purple">Every Photo.</span>
              <br />
              <span className="text-white/80">Instantly.</span>
            </h1>

            <p className="mb-8 max-w-lg text-lg leading-relaxed text-white/50">
              Guests take one selfie and find every photo they appear in — across hundreds of event photos, in under 1 second. No app, no scrolling.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row md:items-start">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-violet-500/30 transition hover:from-violet-600 hover:to-purple-700 hover:shadow-violet-500/50"
              >
                Create Free Event
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white/80 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
              >
                See How It Works
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap justify-center gap-6 md:justify-start">
              {[
                { v: "99%", l: "Face Accuracy" },
                { v: "< 1s", l: "Search Speed" },
                { v: "5GB",  l: "Free Storage" },
              ].map(({ v, l }) => (
                <div key={l} className="text-center">
                  <div className="text-2xl font-extrabold text-white">{v}</div>
                  <div className="text-xs font-medium text-white/40">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* right — phone */}
          <div className="animate-slide-up delay-300 relative flex items-center justify-center">
            <PhoneMockup />

            {/* floating badges */}
            <div className="absolute -left-4 top-16 animate-float glass-dark rounded-xl px-3 py-2 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white">Match found!</p>
                  <p className="text-[9px] text-white/40">11 photos · 0.6s</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-2 top-1/3 animate-float-rev delay-700 glass-dark rounded-xl px-3 py-2 shadow-xl">
              <div className="flex items-center gap-2">
                <ScanFace className="h-5 w-5 text-violet-400" />
                <div>
                  <p className="text-[10px] font-bold text-white">AI scanning…</p>
                  <p className="text-[9px] text-white/40">3 faces detected</p>
                </div>
              </div>
            </div>

            <div className="absolute -left-2 bottom-20 animate-float-slow delay-1000 glass-dark rounded-xl px-3 py-2 shadow-xl">
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-[10px] font-bold text-white">Shared via WhatsApp</p>
                  <p className="text-[9px] text-white/40">89 guests notified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-white/5 bg-white/[0.02] py-10">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { v: "55k+",  l: "Events Created",     icon: <Globe className="h-5 w-5" /> },
              { v: "200M+", l: "Photos Delivered",   icon: <ImageIcon className="h-5 w-5" /> },
              { v: "2M+",   l: "Guests Served",      icon: <Users className="h-5 w-5" /> },
              { v: "99%",   l: "Face Match Accuracy", icon: <ScanFace className="h-5 w-5" /> },
            ].map(({ v, l, icon }) => (
              <div key={l} className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  {icon}
                </div>
                <p className="text-3xl font-extrabold text-white">{v}</p>
                <p className="mt-1 text-sm text-white/40">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">Simple Process</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Up and running in minutes</h2>
            <p className="mt-4 text-lg text-white/40">Three steps from setup to guests finding their photos</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01", icon: <ImageIcon className="h-7 w-7" />,
                t: "Connect Your Photos", d: "Link Google Drive or upload directly. Our AI indexes every face in every photo automatically.",
                gradient: "from-violet-500 to-purple-600",
              },
              {
                n: "02", icon: <Share2 className="h-7 w-7" />,
                t: "Share with Guests", d: "Send a link or QR code via WhatsApp. Guests open directly in their browser — zero app download.",
                gradient: "from-blue-500 to-indigo-600",
              },
              {
                n: "03", icon: <ScanFace className="h-7 w-7" />,
                t: "Selfie Finds All Photos", d: "One selfie, AWS AI matches every photo instantly. Results delivered in under 1 second.",
                gradient: "from-pink-500 to-rose-600",
              },
            ].map(({ n, icon, t, d, gradient }) => (
              <div key={n} className="glass-dark card-hover rounded-3xl p-8">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-white/20">Step {n}</div>
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-xl`}>
                  {icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{t}</h3>
                <p className="leading-relaxed text-white/50">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Demo section ── */}
      <section className="py-28 border-y border-white/5 bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-14 md:grid-cols-2">
            {/* left: photo with face boxes */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=700&h=525&fit=crop&q=80"
                  alt="Wedding guests with face detection"
                  fill className="object-cover" unoptimized
                />
                {/* purple border overlay */}
                <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10" />
                {/* face detection boxes */}
                <div className="absolute border-2 border-violet-400 shadow-[0_0_14px_rgba(167,139,250,0.9)]"
                     style={{ top: "18%", left: "28%", width: "18%", height: "26%" }} />
                <div className="absolute border-2 border-violet-400 shadow-[0_0_14px_rgba(167,139,250,0.9)]"
                     style={{ top: "15%", left: "55%", width: "17%", height: "25%" }} />
                <div className="absolute border-2 border-white/30"
                     style={{ top: "20%", left: "10%", width: "14%", height: "20%" }} />

                {/* scan line */}
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent opacity-80"
                     style={{ animation: "scan 3s ease-in-out infinite", top: "10%" }} />

                {/* AI result badge */}
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-black/60 backdrop-blur-md px-4 py-3 flex items-center gap-3 border border-white/10">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <ScanFace className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">3 faces detected & indexed</p>
                    <p className="text-violet-300 text-xs">AWS Rekognition · processed in 0.8s</p>
                  </div>
                  <Check className="ml-auto h-5 w-5 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* right: text */}
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">AI-Powered</p>
              <h2 className="mb-5 text-3xl font-bold text-white sm:text-4xl">
                Get your photos{" "}
                <span className="gradient-text-purple">instantly with AI</span>
              </h2>
              <p className="mb-8 text-lg text-white/50 leading-relaxed">
                Every face indexed by AWS Rekognition — the same technology trusted by Amazon Photos. Guests find all their photos in under a second.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  { icon: <ScanFace className="h-4 w-4" />, t: "99% face match accuracy", c: "from-violet-500 to-purple-600" },
                  { icon: <Zap className="h-4 w-4" />,      t: "Results in under 1 second", c: "from-amber-500 to-orange-500" },
                  { icon: <Share2 className="h-4 w-4" />,   t: "Photos delivered via WhatsApp", c: "from-emerald-500 to-teal-500" },
                ].map(({ icon, t, c }) => (
                  <li key={t} className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c} text-white shadow-lg`}>
                      {icon}
                    </div>
                    <span className="font-medium text-white/80">{t}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-600 hover:to-purple-700"
              >
                Try Free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">Features</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Everything your event needs</h2>
            <p className="mt-4 text-lg text-white/40">Built for photographers, wedding planners, and event organizers</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <ScanFace className="h-5 w-5" />,   t: "AWS Rekognition AI",    d: "Production-grade face recognition. Same tech used by Amazon Photos — 99%+ accuracy.",        badge: "Production Grade", gradient: "from-violet-500 to-purple-600" },
              { icon: <Zap className="h-5 w-5" />,        t: "Results in Under 1s",   d: "No model loading delays. Guests get their photos before they lower their phone.",             badge: undefined,           gradient: "from-amber-500 to-orange-500" },
              { icon: <Share2 className="h-5 w-5" />,     t: "WhatsApp Sharing",      d: "Share event links directly via WhatsApp. Works perfectly on any mobile browser.",             badge: undefined,           gradient: "from-emerald-500 to-teal-500" },
              { icon: <Camera className="h-5 w-5" />,     t: "Google Drive BYOC",     d: "Photos stay in your Google Drive. Zero upload limits, zero extra storage costs.",             badge: "Free Forever",      gradient: "from-blue-500 to-indigo-600" },
              { icon: <Lock className="h-5 w-5" />,       t: "Gallery Privacy Mode",  d: "Selfie-only mode: blur all photos until guests upload a selfie to unlock their matches.",     badge: "New ✨",            gradient: "from-pink-500 to-rose-600" },
              { icon: <QrCode className="h-5 w-5" />,     t: "QR Code Access",        d: "Print a QR code at the venue. Guests scan and find their photos instantly.",                  badge: undefined,           gradient: "from-indigo-500 to-blue-600" },
              { icon: <Download className="h-5 w-5" />,   t: "Full-Res Download",     d: "Guests download photos at full quality directly from gallery — no account needed.",           badge: undefined,           gradient: "from-teal-500 to-cyan-600" },
              { icon: <Shield className="h-5 w-5" />,     t: "Cloudflare R2 Storage", d: "Photos on Cloudflare CDN. 5GB free, zero egress fees — fast worldwide delivery.",            badge: "5GB Free",          gradient: "from-orange-400 to-amber-500" },
              { icon: <Smartphone className="h-5 w-5" />, t: "Mobile First",          d: "Designed for phones. Works perfectly on iOS and Android — no app ever required.",            badge: undefined,           gradient: "from-blue-400 to-violet-500" },
            ].map(({ icon, t, d, badge, gradient }) => (
              <FeatureCard key={t} icon={icon} title={t} desc={d} badge={badge} gradient={gradient} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-28 border-y border-white/5 bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">Testimonials</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Loved by event organizers</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Priya Sharma",  role: "Wedding Photographer, Delhi",      rating: 5, text: "My clients were blown away. 200 guests all found their photos in seconds. I've never seen anything like it." },
              { name: "Rahul Mehta",   role: "Corporate Events Manager, Mumbai",  rating: 5, text: "Used EventPix for our annual conference. 500 attendees, all found their photos instantly. Saved us hours of manual sharing." },
              { name: "Anjali Verma",  role: "Wedding Planner, Bangalore",        rating: 5, text: "The selfie feature is magic. Guests at the Mehendi were finding themselves in photos before the ceremony even started!" },
              { name: "Vikram Patel",  role: "Birthday Event Host, Pune",         rating: 5, text: "Set up in 10 minutes, shared via WhatsApp, guests loved it. Best event decision I've made." },
              { name: "Sneha Gupta",   role: "Festival Organizer, Jaipur",        rating: 5, text: "Handled 1000+ attendees with ease. The QR code at entrance was a genius touch." },
              { name: "Arjun Singh",   role: "Destination Wedding Host, Goa",     rating: 5, text: "Our photographer used Google Drive, EventPix connected directly. Zero extra work. Incredible." },
            ].map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="py-28">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">Why EventPix</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">EventPix vs Others</h2>
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <div className="grid grid-cols-3 bg-white/[0.03]">
              <div className="p-5 text-sm font-bold text-white/30">Feature</div>
              <div className="border-x border-white/5 p-5 text-center text-sm font-bold text-white/30">Others</div>
              <div className="p-5 text-center text-sm font-bold bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-l border-violet-500/20">
                <span className="gradient-text-purple">EventPix</span>
              </div>
            </div>
            {([
              ["Production-grade face recognition", false, true],
              ["Results in under 1 second",         false, true],
              ["Google Drive (no upload needed)",    false, true],
              ["Free to start — no credit card",    false, true],
              ["Gallery Privacy (selfie unlock)",    false, true],
              ["Works on all mobile browsers",       true,  true],
              ["WhatsApp sharing",                   true,  true],
              ["Cloudflare CDN · zero egress fees",  false, true],
            ] as [string, boolean, boolean][]).map(([feat, oth, ep], i) => (
              <div key={String(feat)} className={`grid grid-cols-3 border-b border-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                <div className="p-4 text-sm font-medium text-white/60">{String(feat)}</div>
                <div className="flex items-center justify-center border-x border-white/5 p-4">
                  {oth ? <Check className="h-5 w-5 text-emerald-400" /> : <X className="h-5 w-5 text-white/15" />}
                </div>
                <div className="flex items-center justify-center bg-violet-500/5 p-4">
                  {ep ? <Check className="h-5 w-5 text-violet-400" /> : <X className="h-5 w-5 text-white/15" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-28 border-t border-white/5 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">Pricing</p>
            <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">Simple, transparent pricing</h2>
            <p className="text-lg text-white/40">Start free. Upgrade when your event needs more.</p>
          </div>
          <PricingSection />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/20 via-purple-600/15 to-indigo-600/20 p-14 backdrop-blur-xl">
            <div className="animate-orb pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="animate-orb delay-1000 pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 text-sm font-medium text-violet-300">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Free to start — no credit card
              </div>
              <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-5xl">
                Ready to wow your guests?
              </h2>
              <p className="mb-8 text-lg text-white/50">
                Create your first event free. Photos found instantly with AI.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 px-10 py-4 text-base font-extrabold text-white shadow-2xl shadow-violet-500/40 transition hover:from-violet-600 hover:to-purple-700"
                >
                  Create Free Event
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                >
                  Learn More <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-extrabold text-white">EventPix</span>
              </div>
              <p className="text-sm text-white/30 leading-relaxed">
                AI-powered photo sharing for events. Built for moments that matter.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: [["#features","Features"],["#pricing","Pricing"],["#how-it-works","How It Works"],["/docs","Documentation"]],
              },
              {
                title: "Support",
                links: [["/help","Help Center"],["/contact","Contact Us"],["/docs","Getting Started"]],
              },
              {
                title: "Legal",
                links: [["/privacy","Privacy Policy"],["/terms","Terms of Service"],["/refund","Refund Policy"]],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="mb-4 text-sm font-semibold text-white/60">{title}</h4>
                <ul className="space-y-3 text-sm">
                  {links.map(([h, l]) => (
                    <li key={h}>
                      <Link href={h} className="text-white/30 transition hover:text-white/70">{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-white/5 pt-8 text-center text-sm text-white/20">
            © {new Date().getFullYear()} EventPix · All rights reserved · Made with ❤️ in India
          </div>
        </div>
      </footer>
    </div>
  );
}
