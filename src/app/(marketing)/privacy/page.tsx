import type { Metadata } from "next";
import { Shield, Eye, Database, Trash2, Lock, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — EventPix",
  description:
    "Learn how EventPix collects, uses, and protects your personal data including facial recognition data.",
};

const sections = [
  {
    icon: <Eye className="h-5 w-5" />,
    title: "1. Information We Collect",
    content: `**Personal Information:** When you create an account, we collect your name, email address, and password (hashed and securely stored).

**Event Data:** Event names, dates, photos, and settings you provide when creating events.

**Biometric Data (Face Embeddings):** When guests use the "Find My Photos" feature, a selfie is captured and processed using AWS Rekognition to generate face embeddings (mathematical representations of facial features). These embeddings are used solely to match guests with event photos.

**Usage Data:** We collect anonymized analytics including page views, feature usage, and device information to improve our services.

**Payment Information:** Payment processing is handled by Razorpay. We do not store credit card numbers, UPI PINs, or banking credentials on our servers. We only store transaction IDs and payment status for billing records.`,
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: "2. How We Use Your Data",
    content: `We use your information for the following purposes:

• **Service Delivery:** To create events, process photos, and enable AI-powered face matching.
• **Face Recognition:** Selfie data is sent to AWS Rekognition for real-time face matching. Face embeddings are stored in an encrypted database linked to the specific event.
• **Communication:** To send account-related emails such as signup confirmation, password resets, and billing receipts.
• **Improvement:** To analyze usage patterns (anonymized) and improve our product.
• **Legal Compliance:** To comply with applicable laws and regulations.

We do **NOT** sell, rent, or trade your personal data to third parties for marketing purposes.`,
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "3. Data Security",
    content: `We implement industry-standard security measures to protect your data:

• **Encryption:** All data is encrypted in transit (TLS 1.3) and at rest.
• **Row-Level Security:** Supabase PostgreSQL database uses Row-Level Security (RLS) policies to ensure data isolation between users.
• **Access Controls:** Only the event host can manage their event data. Guests can only view photos from events they've been invited to.
• **Infrastructure:** We use Vercel (for hosting), Supabase (for database), AWS (for face recognition), and Cloudflare (for storage) — all SOC 2 compliant providers.
• **Passwords:** User passwords are hashed using bcrypt and never stored in plain text.`,
  },
  {
    icon: <Trash2 className="h-5 w-5" />,
    title: "4. Data Retention & Deletion",
    content: `• **Event Data:** Photos and event data are retained for 30 days after event expiry, after which they are automatically deleted.
• **Face Embeddings:** Face embeddings are deleted when the associated event is deleted or expires.
• **Guest Selfies:** Selfie images captured for face matching are processed in real-time and are **NOT permanently stored**. They are discarded immediately after generating match results.
• **Account Deletion:** You can request account deletion at any time by contacting us at support@eventpix.in. We will delete all your data within 30 days.
• **Cached Results:** Guest search results cached in the browser (localStorage) expire after 7 days and can be cleared by the guest at any time.`,
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "5. Biometric Data Disclosure (DPDPA Compliance)",
    content: `Under India's Digital Personal Data Protection Act (DPDPA) 2023, facial recognition data is classified as sensitive personal data. Here's how we handle it:

• **Consent:** Guests are shown a clear consent prompt before their selfie is captured for face matching. No biometric processing occurs without explicit consent.
• **Purpose Limitation:** Face embeddings are used exclusively for matching guests with their event photos. They are never used for surveillance, advertising, or any other purpose.
• **Data Minimization:** We only generate face embeddings (128-dimensional vectors) — we do not store the original selfie images.
• **Third-Party Processing:** Face detection is performed by AWS Rekognition (Amazon Web Services), which is GDPR and SOC 2 compliant. AWS processes images in real-time and does not retain them.
• **Right to Erasure:** You have the right to request deletion of your biometric data at any time.`,
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: "6. Third-Party Services",
    content: `We use the following third-party services:

| Service | Purpose | Data Shared |
|---------|---------|-------------|
| Supabase | Database & Auth | Email, password (hashed), event data |
| AWS Rekognition | Face matching | Selfie images (real-time, not stored) |
| Cloudflare R2 | Photo storage | Event photos |
| Google Drive | Photo storage (BYOC) | Event photos via user's own Drive |
| Razorpay | Payments | Transaction details (no card data stored by us) |
| Vercel | Hosting | Application logs, IP addresses |

Each third-party provider has their own privacy policy. We recommend reviewing them for details on their data handling practices.`,
  },
];

export default function PrivacyPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-blue-700">
          <Shield className="h-4 w-4" />
          Privacy Policy
        </div>
        <h1 className="mb-4 text-4xl font-extrabold text-slate-900">
          Your Privacy Matters
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-500">
          We are committed to protecting your personal data. This policy explains
          what we collect, how we use it, and your rights.
        </p>
        <p className="mt-3 text-sm text-slate-400">
          Last updated: April 15, 2026
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 text-white">
                {section.icon}
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {section.title}
              </h2>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 [&_strong]:text-slate-800">
              {section.content.split("\n\n").map((para, i) => (
                <p key={i} className="mb-3 whitespace-pre-line leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-10 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 p-8 text-center">
        <h3 className="mb-2 text-lg font-bold text-slate-900">
          Questions about your privacy?
        </h3>
        <p className="mb-4 text-slate-500">
          Contact our Data Protection Officer at{" "}
          <a
            href="mailto:privacy@eventpix.in"
            className="font-medium text-blue-600 hover:underline"
          >
            privacy@eventpix.in
          </a>
        </p>
      </div>
    </div>
  );
}
