import type { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle, Camera, ScanFace, CreditCard, UserCircle,
  Settings, Search, ChevronRight, ArrowRight, MessageCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center — EventPix",
  description:
    "Find answers to common questions about EventPix — creating events, face recognition, billing, and more.",
};

const categories = [
  {
    icon: <Camera className="h-6 w-6" />,
    title: "Getting Started",
    color: "from-blue-500 to-sky-400",
    articles: [
      { q: "How do I create my first event?", a: "Sign up for a free account, click \"New Event\" on your dashboard, enter the event name and date, and you're ready to go! You can optionally add a PIN code for privacy." },
      { q: "What storage options are available?", a: "You can upload photos directly to Cloudflare R2 (our default storage), or connect your Google Drive using our BYOC (Bring Your Own Cloud) feature for unlimited free storage." },
      { q: "How do I activate my event for guests?", a: "On your event page, click the \"Activate\" button to change the status from Draft to Active. Once active, guests can access the gallery via the shared link." },
      { q: "Can I set up multiple events?", a: "Yes! The number of events depends on your plan. Free accounts get 1 event, while paid plans offer 3 to unlimited events." },
    ],
  },
  {
    icon: <ScanFace className="h-6 w-6" />,
    title: "Face Recognition",
    color: "from-indigo-500 to-blue-500",
    articles: [
      { q: "How does AI face recognition work?", a: "After you upload photos, our AI (AWS Rekognition) scans each photo to detect and index faces. When a guest takes a selfie, the AI matches their face against all indexed faces to find their photos — typically in under 1 second." },
      { q: "How accurate is the face matching?", a: "AWS Rekognition achieves 99%+ accuracy with good quality photos. Results are best with clear, well-lit photos where faces are visible. Group photos and side profiles may have lower match rates." },
      { q: "Why can't the AI find me in photos?", a: "Common reasons: your face may be partially hidden, the photo is dark/blurry, you're wearing sunglasses or a mask, or the selfie quality is poor. Try retaking the selfie in good lighting." },
      { q: "Is my selfie stored?", a: "No. Your selfie is processed in real-time for face matching and immediately discarded. We never permanently store guest selfies. Only the match results are cached in your browser for 7 days." },
    ],
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "Billing & Plans",
    color: "from-emerald-500 to-teal-500",
    articles: [
      { q: "What payment methods do you accept?", a: "We accept UPI, credit/debit cards (Visa, Mastercard, RuPay), net banking, and popular digital wallets through Razorpay." },
      { q: "Is there a free plan?", a: "Yes! Our free plan includes 1 event, 5GB storage, 100 guests, AI face search, WhatsApp sharing, and PIN protection — all for ₹0, no credit card required." },
      { q: "Can I upgrade my plan later?", a: "Yes. You can upgrade from your billing dashboard at any time. The new plan's features will be available immediately." },
      { q: "How does your refund policy work?", a: "We offer a full refund within 48 hours of purchase if the event hasn't been used, or within 7 days if face recognition doesn't work properly. See our Refund Policy for full details." },
    ],
  },
  {
    icon: <UserCircle className="h-6 w-6" />,
    title: "Account & Security",
    color: "from-amber-500 to-orange-500",
    articles: [
      { q: "How do I reset my password?", a: "Click \"Forgot password?\" on the login page, enter your email, and we'll send you a reset link. The link expires after 1 hour." },
      { q: "Can I delete my account?", a: "Yes. Email support@eventpix.in from your registered email address to request account deletion. All your data will be permanently deleted within 30 days." },
      { q: "Is my data secure?", a: "Yes. We use encryption in transit (TLS 1.3) and at rest, Row-Level Security for data isolation, and all our infrastructure providers (Supabase, AWS, Cloudflare, Vercel) are SOC 2 compliant." },
      { q: "What happens to my data when an event expires?", a: "Events expire 30 days after the event date. After expiry, all photos, face embeddings, and event data are automatically and permanently deleted." },
    ],
  },
  {
    icon: <Settings className="h-6 w-6" />,
    title: "Troubleshooting",
    color: "from-slate-600 to-slate-700",
    articles: [
      { q: "Photos aren't loading in the guest gallery", a: "This can happen if Cloudflare R2 or Google Drive is temporarily unavailable. Try refreshing the page. If using Google Drive BYOC, make sure the Drive files are still accessible." },
      { q: "Face indexing is stuck or failing", a: "Large batches of photos may take longer. If indexing fails, check that the photos are in JPEG/PNG format and at least 640px. Contact support if the issue persists." },
      { q: "QR code isn't scanning", a: "Make sure the QR code is printed at a sufficient size (at least 3x3 cm). Guests should use their phone's camera to scan — most modern phones support this natively." },
      { q: "Guest can't access the event", a: "If the event is PIN-protected, ensure the guest has the correct PIN. Also verify the event status is \"Active\" (not Draft or Archived)." },
    ],
  },
];

export default function HelpPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-blue-700">
          <HelpCircle className="h-4 w-4" />
          Help Center
        </div>
        <h1 className="mb-4 text-4xl font-extrabold text-slate-900">
          How can we help you?
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-500">
          Search our knowledge base or browse by category to find answers to
          your questions.
        </p>
      </div>

      {/* Search */}
      <div className="mb-12">
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search for help articles..."
            className="w-full rounded-2xl border border-blue-200 bg-white py-4 pl-12 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-12 grid gap-3 sm:grid-cols-3">
        {[
          { icon: <Camera className="h-5 w-5" />, label: "Getting Started Guide", href: "/docs", color: "text-blue-600 bg-blue-50" },
          { icon: <CreditCard className="h-5 w-5" />, label: "Pricing & Plans", href: "/#pricing", color: "text-emerald-600 bg-emerald-50" },
          { icon: <MessageCircle className="h-5 w-5" />, label: "Contact Support", href: "/contact", color: "text-amber-600 bg-amber-50" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-4 transition hover:border-blue-300 hover:shadow-md"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}>
              {item.icon}
            </div>
            <span className="font-medium text-slate-700">{item.label}</span>
            <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
          </Link>
        ))}
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <div key={cat.title}>
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white`}
              >
                {cat.icon}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{cat.title}</h2>
            </div>
            <div className="space-y-2">
              {cat.articles.map((article) => (
                <details
                  key={article.q}
                  className="group rounded-xl border border-blue-100 bg-white"
                >
                  <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-slate-900 transition hover:text-blue-600">
                    {article.q}
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-slate-400 transition group-open:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="border-t border-blue-50 px-5 pb-5 pt-3 text-slate-500 leading-relaxed">
                    {article.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Still need help */}
      <div className="mt-12 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 p-8 text-center">
        <HelpCircle className="mx-auto mb-3 h-8 w-8 text-blue-500" />
        <h3 className="mb-2 text-lg font-bold text-slate-900">
          Can&apos;t find what you&apos;re looking for?
        </h3>
        <p className="mb-4 text-slate-500">
          Our support team typically responds within 24 hours.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-sky-400 px-6 py-2.5 font-semibold text-white transition hover:from-blue-600 hover:to-sky-500"
        >
          Contact Support <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
