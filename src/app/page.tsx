import Link from "next/link";
import {
  Camera, Share2, Lock, ScanFace, ArrowRight, Check, X,
  Download, Zap, Shield, QrCode, Smartphone, Image as ImageIcon,
} from "lucide-react";

/* ─── floating photo cards ─────────────────────────────────────────────── */
const CARDS = [
  { gradient: "from-violet-500 to-indigo-700",   label: "Bride & Groom", badge: "3 matches",  pos: "top-[2%]    -left-[18%]",  anim: "animate-float",     rotate: "-6deg", delay: "delay-0",    size: "w-36 h-44" },
  { gradient: "from-blue-500   to-indigo-600",   label: "Reception",     badge: "7 matches",  pos: "top-[18%]  -right-[20%]",  anim: "animate-float-rev", rotate:  "8deg", delay: "delay-500",  size: "w-32 h-40" },
  { gradient: "from-purple-500 to-violet-700",   label: "Mehendi",       badge: "12 matches", pos: "bottom-[18%] -left-[22%]", anim: "animate-float-slow",rotate:  "4deg", delay: "delay-1000", size: "w-40 h-48" },
  { gradient: "from-indigo-400 to-blue-700",     label: "Sangeet",       badge: "5 matches",  pos: "bottom-[5%] -right-[16%]", anim: "animate-float",     rotate: "-8deg", delay: "delay-2000", size: "w-32 h-36" },
];

function PhotoCard({ gradient, label, badge, pos, anim, rotate, delay, size }: (typeof CARDS)[number]) {
  return (
    <div className={`absolute ${pos} ${anim} ${delay} cursor-default`} style={{ "--r": rotate } as React.CSSProperties}>
      <div className={`glass rounded-2xl overflow-hidden shadow-2xl shadow-violet-300/40 ${size}`} style={{ transform: `rotate(${rotate})` }}>
        <div className={`h-full w-full bg-gradient-to-br ${gradient} relative`}>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-12 border-2 border-amber-300 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-amber-300 rounded-full" />
          </div>
          <div className="absolute left-0 right-0 h-px bg-amber-300/80 shadow-[0_0_8px_2px_rgba(251,191,36,0.5)]"
               style={{ animation: "scan 2s ease-in-out infinite", top: "10%" }} />
          <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm p-2">
            <p className="text-white text-[11px] font-medium truncate">{label}</p>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-violet-600 px-3 py-1 text-[10px] font-bold text-white shadow-lg">
        ✓ {badge}
      </div>
    </div>
  );
}

/* ─── phone mockup ──────────────────────────────────────────────────────── */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-56 animate-float-slow">
      <div className="relative rounded-[2.5rem] border-[6px] border-slate-800 bg-slate-900 shadow-[0_40px_80px_-20px_rgba(124,58,237,0.5),0_0_0_1px_rgba(139,92,246,0.2)] overflow-hidden">
        <div className="relative z-10 mx-auto mt-2 h-5 w-24 rounded-full bg-slate-900" />
        <div className="h-[480px] w-full overflow-hidden bg-white">
          <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5">
            <span className="text-[9px] font-bold text-slate-800">9:41</span>
            <span className="text-[9px] font-medium text-violet-700">EventPix</span>
            <div className="flex gap-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-600" />
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              <div className="h-1.5 w-1.5 rounded-full bg-violet-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-3 text-white">
            <p className="text-[10px] font-medium opacity-70">ANURAG WEDDING</p>
            <p className="text-sm font-bold">89 Photos</p>
            <button className="mt-2 flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold backdrop-blur">
              <ScanFace className="h-3 w-3" /> MY PHOTOS
            </button>
          </div>
          <div className="grid grid-cols-3 gap-px p-px">
            {[
              "from-violet-300 to-indigo-500","from-blue-300 to-violet-500","from-indigo-300 to-blue-500",
              "from-violet-400 to-purple-600","from-blue-400 to-indigo-600","from-purple-300 to-violet-500",
              "from-indigo-300 to-blue-600",  "from-violet-400 to-indigo-500","from-blue-300 to-purple-500",
            ].map((g, i) => (
              <div key={i} className={`aspect-square bg-gradient-to-br ${g}`} />
            ))}
          </div>
          <div className="mx-2 mt-2 rounded-xl bg-violet-50 border border-violet-100 p-2">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600" />
              <div>
                <p className="text-[9px] font-bold text-slate-900">11 photos found!</p>
                <p className="text-[8px] text-violet-500">Matched via AWS AI</p>
              </div>
              <Check className="ml-auto h-4 w-4 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="flex justify-center bg-white pb-2 pt-1">
          <div className="h-1 w-20 rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-40 rounded-full bg-violet-500/25 blur-2xl" />
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8F7FF]">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 z-50 w-full border-b border-violet-100/80 bg-[#F8F7FF]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-200">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">EventPix</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {[["#features","Features"],["#how-it-works","How It Works"],["#pricing","Pricing"]].map(([h,l]) => (
              <Link key={h} href={h} className="text-sm font-medium text-slate-500 transition hover:text-slate-900">{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-violet-50">Login</Link>
            <Link href="/signup" className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-200/60 transition hover:from-violet-700 hover:to-indigo-700">
              Try for free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen overflow-hidden pt-16">
        <div className="animate-orb delay-0    pointer-events-none absolute -top-32  -right-32 h-96 w-96 rounded-full bg-violet-300/35 blur-3xl" />
        <div className="animate-orb delay-1000 pointer-events-none absolute  top-1/2  -left-40  h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="animate-orb delay-500  pointer-events-none absolute  bottom-0  right-1/4 h-72 w-72 rounded-full bg-blue-200/25   blur-3xl" />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          {/* left */}
          <div className="animate-fade-up text-center md:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Powered by AWS Rekognition AI
            </div>
            <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl">
              AI Photo Sharing
              <br />
              <span className="shine-text">for Every Moment</span>
            </h1>
            <p className="mb-8 max-w-lg text-lg leading-relaxed text-slate-500">
              Guests take one selfie and instantly find every photo they appear in.
              No app download, no scrolling — delivered via WhatsApp in seconds.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row md:items-start">
              <Link href="/signup"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-violet-200/60 transition hover:from-violet-700 hover:to-indigo-700">
                Create Free Event <ArrowRight className="h-5 w-5 animate-bounce-x" />
              </Link>
              <Link href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-white/80 px-8 py-4 text-base font-semibold text-slate-700 backdrop-blur transition hover:bg-violet-50">
                See How It Works
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-8 md:justify-start">
              {[{ v:"99%",l:"Face Accuracy"},{ v:"< 1s",l:"Search Speed"},{ v:"10GB",l:"Free Storage"}].map(({v,l}) => (
                <div key={l} className="text-center">
                  <div className="text-2xl font-extrabold text-violet-700">{v}</div>
                  <div className="text-xs font-medium text-slate-400">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* right */}
          <div className="animate-fade-up delay-300 relative flex items-center justify-center" style={{ height: 540 }}>
            {CARDS.map((c) => <PhotoCard key={c.label} {...c} />)}
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-500">Simple Process</p>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Up and running in minutes</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { n:"01", icon:<ImageIcon className="h-7 w-7"/>, t:"Connect Photos",       d:"Link Google Drive or upload to Cloudflare R2. AI indexes every face automatically.", bg:"from-violet-600 to-indigo-600" },
              { n:"02", icon:<Share2    className="h-7 w-7"/>, t:"Share via WhatsApp",   d:"Send a link or QR code. Guests open directly in browser — zero app downloads needed.", bg:"from-indigo-500 to-blue-600"   },
              { n:"03", icon:<ScanFace  className="h-7 w-7"/>, t:"Selfie Finds Photos",  d:"One selfie, AWS AI matches every photo instantly. Results appear in under 1 second.",  bg:"from-purple-600 to-violet-700" },
            ].map(({n,icon,t,d,bg}) => (
              <div key={n} className="card-3d rounded-3xl border border-violet-100 bg-white p-8 shadow-sm">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-violet-300">Step {n}</div>
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${bg} text-white shadow-lg shadow-violet-100`}>{icon}</div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{t}</h3>
                <p className="leading-relaxed text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-y border-violet-100 bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-500">Features</p>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything your event needs</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon:<ScanFace   className="h-5 w-5"/>, t:"AWS Rekognition AI",       d:"Production-grade face recognition. Same tech used by Amazon Photos — 99%+ accuracy.",          badge:"Production Grade",  bg:"from-violet-600 to-indigo-600"  },
              { icon:<Zap        className="h-5 w-5"/>, t:"Results in Under 1s",      d:"No 30-second model loading. Guests get their photos before they lower their phone.",            badge:null,                bg:"from-amber-500 to-orange-500"  },
              { icon:<Share2     className="h-5 w-5"/>, t:"WhatsApp Sharing",         d:"Share event links directly via WhatsApp. Works perfectly on any mobile browser.",              badge:null,                bg:"from-emerald-500 to-teal-600"  },
              { icon:<Camera     className="h-5 w-5"/>, t:"Google Drive BYOC",        d:"Photos stay in your Google Drive. Zero upload limits, zero storage costs.",                    badge:"Free Forever",      bg:"from-blue-500 to-indigo-600"   },
              { icon:<Lock       className="h-5 w-5"/>, t:"PIN Protection",           d:"Keep galleries private with a PIN code. Only your invited guests can access.",                 badge:null,                bg:"from-slate-600 to-slate-700"   },
              { icon:<QrCode     className="h-5 w-5"/>, t:"QR Code Access",           d:"Print a QR code at the venue. Guests scan and find their photos instantly.",                   badge:null,                bg:"from-violet-500 to-purple-600" },
              { icon:<Download   className="h-5 w-5"/>, t:"Full-Res Download",        d:"Guests download photos at full quality directly from gallery — no account needed.",            badge:null,                bg:"from-teal-500 to-cyan-600"     },
              { icon:<Shield     className="h-5 w-5"/>, t:"Cloudflare R2 Storage",    d:"Photos on Cloudflare CDN. 10GB free, zero egress fees — fast worldwide delivery.",            badge:"10GB Free",         bg:"from-orange-500 to-amber-600"  },
              { icon:<Smartphone className="h-5 w-5"/>, t:"Mobile First",             d:"Designed for phones. Works perfectly on iOS and Android — no app ever required.",             badge:null,                bg:"from-indigo-500 to-blue-600"   },
            ].map(({icon,t,d,badge,bg}) => (
              <div key={t} className="card-3d cursor-default rounded-2xl border border-violet-100 bg-[#F8F7FF] p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${bg} text-white shadow-md`}>{icon}</div>
                  {badge && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">{badge}</span>}
                </div>
                <h3 className="mb-1.5 font-bold text-slate-900">{t}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-500">Why EventPix</p>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">EventPix vs Other Platforms</h2>
          </div>
          <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xl shadow-violet-100/40">
            <div className="grid grid-cols-3 bg-violet-50/60">
              <div className="p-5 text-sm font-bold text-slate-400">Feature</div>
              <div className="border-x border-violet-100 p-5 text-center text-sm font-bold text-slate-400">Others</div>
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-center text-sm font-bold text-white">EventPix</div>
            </div>
            {([
              ["Production-grade face recognition", false, true],
              ["Results in under 1 second",         false, true],
              ["Google Drive (no upload needed)",    false, true],
              ["Free to start — no credit card",    false, true],
              ["Works on all mobile browsers",       true,  true],
              ["WhatsApp sharing",                   true,  true],
              ["PIN-protected galleries",            true,  true],
              ["Cloudflare CDN · zero egress fees",  false, true],
            ] as [string, boolean, boolean][]).map(([feat,oth,ep],i) => (
              <div key={String(feat)} className={`grid grid-cols-3 border-b border-slate-50 ${i%2?"bg-violet-50/20":"bg-white"}`}>
                <div className="p-4 text-sm font-medium text-slate-700">{String(feat)}</div>
                <div className="flex items-center justify-center border-x border-violet-50 p-4">
                  {oth ? <Check className="h-5 w-5 text-emerald-400"/> : <X className="h-5 w-5 text-slate-200"/>}
                </div>
                <div className="flex items-center justify-center bg-violet-50/30 p-4">
                  {ep  ? <Check className="h-5 w-5 text-violet-600"/> : <X className="h-5 w-5 text-slate-200"/>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="border-t border-violet-100 bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-500">Pricing</p>
            <h2 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-400">Start free. Upgrade when you need more storage.</p>
          </div>
          <div className="grid items-start gap-6 md:grid-cols-3">
            {/* Free */}
            <div className="card-3d rounded-3xl border border-violet-100 bg-[#F8F7FF] p-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Free Event</p>
              <div className="mb-1"><span className="text-5xl font-extrabold text-slate-900">₹0</span></div>
              <p className="mb-6 text-sm text-slate-400">No credit card · ever</p>
              <Link href="/signup" className="mb-8 block rounded-2xl border-2 border-violet-200 bg-white py-3 text-center text-sm font-bold text-violet-700 transition hover:bg-violet-50">
                Get Started Free
              </Link>
              <ul className="space-y-3">
                {["Google Drive (unlimited photos)","1 active event","50 guests","AWS face recognition","WhatsApp sharing","PIN protection"].map((i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-slate-500">
                    <Check className="h-4 w-4 flex-shrink-0 text-violet-400"/>{i}
                  </li>
                ))}
              </ul>
            </div>

            {/* Starter — elevated */}
            <div className="card-3d relative rounded-3xl border-2 border-violet-600 bg-white p-8 shadow-2xl shadow-violet-100/80 md:-mt-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-1.5 text-xs font-bold text-white shadow-lg">
                MOST POPULAR
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-violet-500">Starter Event</p>
              <div className="mb-1"><span className="text-5xl font-extrabold text-slate-900">₹1,499</span></div>
              <p className="mb-6 text-sm text-slate-400">per event · 1 year validity</p>
              <Link href="/signup" className="mb-8 block rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-center text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-indigo-700">
                Get Started
              </Link>
              <ul className="space-y-3">
                {["25 GB on Cloudflare R2","1 event","500 guests","AWS face recognition","Google Drive BYOC","WhatsApp + QR sharing","Download control","Priority support"].map((i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-slate-500">
                    <Check className="h-4 w-4 flex-shrink-0 text-violet-600"/>{i}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="card-3d rounded-3xl border border-violet-100 bg-[#F8F7FF] p-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Pro Event</p>
              <div className="mb-1"><span className="text-5xl font-extrabold text-slate-900">₹3,499</span></div>
              <p className="mb-6 text-sm text-slate-400">per event · 1 year validity</p>
              <Link href="/signup" className="mb-8 block rounded-2xl border-2 border-violet-200 bg-white py-3 text-center text-sm font-bold text-violet-700 transition hover:bg-violet-50">
                Get Started
              </Link>
              <ul className="space-y-3">
                {["100 GB on Cloudflare R2","Unlimited events","Unlimited guests","AWS face recognition","Google Drive BYOC","WhatsApp + QR sharing","Download control","Dedicated support","Custom branding"].map((i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-slate-500">
                    <Check className="h-4 w-4 flex-shrink-0 text-violet-400"/>{i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 p-12 shadow-2xl shadow-violet-300/40">
            <div className="animate-orb          pointer-events-none absolute -top-12  -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="animate-orb delay-1000 pointer-events-none absolute -bottom-8 -left-8  h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">Ready to wow your guests?</h2>
              <p className="mb-8 text-lg text-indigo-100">
                Create your first event free. No credit card.
                <br />Photos found instantly with AI magic.
              </p>
              <Link href="/signup"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-4 text-base font-extrabold text-violet-700 shadow-xl transition hover:bg-violet-50">
                Create Free Event <ArrowRight className="h-5 w-5 animate-bounce-x" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-violet-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <span className="font-extrabold text-slate-800">EventPix</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              {[["#features","Features"],["#pricing","Pricing"],["/login","Login"],["/signup","Sign Up"]].map(([h,l]) => (
                <Link key={h} href={h} className="transition hover:text-slate-700">{l}</Link>
              ))}
            </div>
            <p className="text-sm text-slate-300">&copy; {new Date().getFullYear()} EventPix · Built for moments that matter</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
