import type { Metadata } from "next";
import Link from "next/link";
import {
  Camera, Upload, ScanFace, Share2, QrCode, Lock,
  Settings, ArrowRight, BookOpen, Smartphone, ImageIcon,
  HardDrive, Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation — EventPix",
  description:
    "Learn how to create events, upload photos, set up face recognition, and share with guests on EventPix.",
};

const guides = [
  {
    icon: <Camera className="h-6 w-6" />,
    title: "Create Your First Event",
    steps: [
      "Sign up for a free EventPix account",
      "Click \"New Event\" on your dashboard",
      "Enter event name, date, and optional PIN code",
      "Your event is created in seconds — ready for photos!",
    ],
    color: "from-blue-500 to-sky-400",
  },
  {
    icon: <Upload className="h-6 w-6" />,
    title: "Upload Photos",
    steps: [
      "Open your event from the dashboard",
      "Choose upload method: Direct Upload (R2) or Google Drive",
      "For Direct Upload: drag & drop or click to browse files",
      "For Google Drive: connect your Drive and select a folder",
      "Photos are automatically indexed by AI for face recognition",
    ],
    color: "from-sky-400 to-cyan-500",
  },
  {
    icon: <ScanFace className="h-6 w-6" />,
    title: "AI Face Recognition",
    steps: [
      "After uploading, click \"Index Faces\" on your event page",
      "AWS Rekognition scans every photo and detects faces",
      "Each face is indexed — this typically takes a few seconds per photo",
      "Once indexed, guests can find their photos with a selfie",
      "Face matching accuracy is 99%+ with good quality photos",
    ],
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: <Share2 className="h-6 w-6" />,
    title: "Share with Guests",
    steps: [
      "Activate your event (change status from Draft to Active)",
      "Copy the guest link from the Share button",
      "Share via WhatsApp, SMS, email, or social media",
      "Print the QR code to display at the venue",
      "Guests open the link → take a selfie → find their photos instantly!",
    ],
    color: "from-emerald-500 to-teal-500",
  },
];

const faqItems = [
  {
    q: "What image formats are supported?",
    a: "We support JPEG, PNG, and WebP formats. For best face recognition results, use high-quality JPEG images.",
  },
  {
    q: "How many photos can I upload?",
    a: "This depends on your plan's storage limit. Free plan includes 5GB (approximately 1,000 photos at 5MB each). Paid plans offer up to 100GB.",
  },
  {
    q: "Does face recognition work with group photos?",
    a: "Yes! AWS Rekognition can detect up to 25 faces per photo. Guests will find themselves in individual and group photos.",
  },
  {
    q: "Do guests need to download an app?",
    a: "No. Everything works in the mobile browser. Guests simply open the link you share and take a selfie — no app download required.",
  },
  {
    q: "Is the face data stored permanently?",
    a: "No. Selfie images are processed in real-time and discarded immediately. Face embeddings stored for matching are deleted when your event expires.",
  },
  {
    q: "Can I use my own Google Drive for storage?",
    a: "Yes! Our Google Drive BYOC (Bring Your Own Cloud) feature lets you keep photos in your own Google Drive with zero upload limits and zero storage costs to us.",
  },
  {
    q: "What happens when my event expires?",
    a: "Events expire 30 days after the event date (or 30 days after creation if no date is set). After expiry, all data including photos and face embeddings are automatically deleted.",
  },
  {
    q: "Can I password-protect my event?",
    a: "Yes! Set a PIN code when creating your event. Guests will need to enter the PIN before accessing the gallery.",
  },
];

export default function DocsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-blue-700">
          <BookOpen className="h-4 w-4" />
          Documentation
        </div>
        <h1 className="mb-4 text-4xl font-extrabold text-slate-900">
          Getting Started with EventPix
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-500">
          Everything you need to know to create events, upload photos, and let
          guests find themselves with AI.
        </p>
      </div>

      {/* Quick Links */}
      <div className="mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <Camera className="h-5 w-5" />, label: "Create Event", href: "#create-event" },
          { icon: <Upload className="h-5 w-5" />, label: "Upload Photos", href: "#upload" },
          { icon: <ScanFace className="h-5 w-5" />, label: "Face Recognition", href: "#face-ai" },
          { icon: <Share2 className="h-5 w-5" />, label: "Share & QR", href: "#share" },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-4 transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
              {item.icon}
            </div>
            <span className="font-medium text-slate-700">{item.label}</span>
            <ArrowRight className="ml-auto h-4 w-4 text-slate-300" />
          </a>
        ))}
      </div>

      {/* Step-by-Step Guides */}
      <div className="space-y-6">
        {guides.map((guide, idx) => (
          <div
            key={guide.title}
            id={["create-event", "upload", "face-ai", "share"][idx]}
            className="scroll-mt-20 rounded-2xl border border-blue-100 bg-white p-8 shadow-sm"
          >
            <div className="mb-6 flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${guide.color} text-white shadow-lg`}
              >
                {guide.icon}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  Step {idx + 1}
                </p>
                <h2 className="text-xl font-bold text-slate-900">
                  {guide.title}
                </h2>
              </div>
            </div>
            <ol className="space-y-3">
              {guide.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {i + 1}
                  </span>
                  <span className="text-slate-600">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {/* System Requirements */}
      <div className="mt-10 rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-slate-900">
          System Requirements
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: <Smartphone className="h-5 w-5" />,
              title: "Guest Access",
              items: [
                "Any modern mobile browser",
                "Camera access for selfie",
                "No app download needed",
              ],
            },
            {
              icon: <Settings className="h-5 w-5" />,
              title: "Host Dashboard",
              items: [
                "Chrome, Firefox, Safari, Edge",
                "Desktop or tablet recommended",
                "Google account (for Drive BYOC)",
              ],
            },
            {
              icon: <ImageIcon className="h-5 w-5" />,
              title: "Photo Requirements",
              items: [
                "JPEG, PNG, or WebP format",
                "Good lighting for best AI results",
                "Minimum 640px resolution",
              ],
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-100 p-5"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                {item.icon}
              </div>
              <h3 className="mb-2 font-semibold text-slate-900">
                {item.title}
              </h3>
              <ul className="space-y-1 text-sm text-slate-500">
                {item.items.map((i) => (
                  <li key={i}>• {i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-10">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-blue-100 bg-white"
            >
              <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-slate-900 transition hover:text-blue-600">
                {item.q}
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
              <div className="border-t border-blue-50 px-5 pb-5 pt-3 text-slate-500">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Still need help */}
      <div className="mt-10 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 p-8 text-center">
        <h3 className="mb-2 text-lg font-bold text-slate-900">
          Still have questions?
        </h3>
        <p className="mb-4 text-slate-500">
          Our support team is here to help you get the most out of EventPix.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-sky-400 px-6 py-2.5 font-semibold text-white transition hover:from-blue-600 hover:to-sky-500"
          >
            Visit Help Center
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-6 py-2.5 font-semibold text-slate-700 transition hover:bg-blue-50"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
