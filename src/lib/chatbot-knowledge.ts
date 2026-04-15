export type QA = {
  question: string;
  keywords: string[];
  answer: string;
  category: "getting-started" | "face-recognition" | "billing" | "account" | "troubleshooting";
};

export const chatbotKnowledge: QA[] = [
  // ── Getting Started ──
  {
    question: "How do I create an event?",
    keywords: ["create", "new", "event", "start", "setup", "make"],
    answer: "To create an event: Sign up for free → Click \"New Event\" on your dashboard → Enter event name, date, and optional PIN → Done! You can then upload photos and share with guests.",
    category: "getting-started",
  },
  {
    question: "How do I upload photos?",
    keywords: ["upload", "photo", "image", "add", "import", "pictures"],
    answer: "Open your event → Choose upload method: Direct Upload (Cloudflare R2) or Google Drive BYOC → Upload your photos → AI will automatically index faces for face recognition.",
    category: "getting-started",
  },
  {
    question: "How do I share with guests?",
    keywords: ["share", "guest", "invite", "link", "whatsapp", "qr", "send"],
    answer: "Activate your event → Click the Share button → Copy the guest link or download the QR code → Share via WhatsApp, SMS, or print the QR at your venue. Guests don't need to download any app!",
    category: "getting-started",
  },
  {
    question: "Do guests need to download an app?",
    keywords: ["app", "download", "install", "mobile"],
    answer: "No! EventPix works entirely in the mobile browser. Guests just open the shared link, take a selfie, and find their photos — no app download needed.",
    category: "getting-started",
  },
  {
    question: "What is Google Drive BYOC?",
    keywords: ["google", "drive", "byoc", "storage", "cloud"],
    answer: "BYOC means 'Bring Your Own Cloud'. You can connect your Google Drive to store event photos there. This gives you unlimited storage at zero cost — photos stay in YOUR Drive, and EventPix just reads them.",
    category: "getting-started",
  },

  // ── Face Recognition ──
  {
    question: "How does face recognition work?",
    keywords: ["face", "recognition", "ai", "detect", "match", "selfie", "aws", "rekognition"],
    answer: "When you upload photos, AWS Rekognition AI scans each photo and indexes every face it detects. When a guest takes a selfie, the AI matches their face against all indexed faces and returns their photos — typically in under 1 second with 99%+ accuracy.",
    category: "face-recognition",
  },
  {
    question: "Why can't AI find my photos?",
    keywords: ["not found", "can't find", "no match", "no result", "missing", "accuracy"],
    answer: "Common reasons: 1) Your face may be partially hidden or turned sideways, 2) The photo is too dark or blurry, 3) You're wearing sunglasses/mask, 4) Selfie quality is poor. Try retaking the selfie in good lighting, facing the camera directly.",
    category: "face-recognition",
  },
  {
    question: "Is my selfie stored?",
    keywords: ["selfie", "stored", "save", "privacy", "data", "biometric"],
    answer: "No! Your selfie is processed in real-time for face matching and immediately discarded. We never permanently store guest selfies. Only the match results are cached in your browser for 7 days for convenience.",
    category: "face-recognition",
  },
  {
    question: "How accurate is face matching?",
    keywords: ["accurate", "accuracy", "reliable", "99"],
    answer: "AWS Rekognition achieves 99%+ accuracy with good quality photos. The same technology is used by Amazon Photos. Best results come from well-lit, clear photos where faces are clearly visible.",
    category: "face-recognition",
  },

  // ── Billing ──
  {
    question: "What are the pricing plans?",
    keywords: ["price", "pricing", "plan", "cost", "how much", "free", "paid", "rupees"],
    answer: "We offer 5 plans: Free (₹0) — 1 event, 5GB, 100 guests | Basic (₹299) — 1 event, 15GB, 200 guests | Standard (₹449, most popular) — 3 events, 30GB, 500 guests | Pro (₹720) — 5 events, 50GB, unlimited guests | Premium (₹1,599) — unlimited events, 100GB, unlimited guests.",
    category: "billing",
  },
  {
    question: "What payment methods are accepted?",
    keywords: ["payment", "pay", "upi", "card", "credit", "debit", "razorpay", "method"],
    answer: "We accept UPI, credit/debit cards (Visa, Mastercard, RuPay), net banking, and popular digital wallets — all processed securely through Razorpay.",
    category: "billing",
  },
  {
    question: "Can I get a refund?",
    keywords: ["refund", "cancel", "money back", "return"],
    answer: "Yes! Full refund within 48 hours if the event hasn't been used, or within 7 days if face recognition doesn't work. Email support@eventpix.in with your details. See our Refund Policy page for full details.",
    category: "billing",
  },
  {
    question: "Is the free plan really free?",
    keywords: ["free", "trial", "credit card", "charge"],
    answer: "Yes, 100% free forever. No credit card required. You get 1 event, 5GB storage, 100 guests, AI face search, WhatsApp sharing, and PIN protection — all at ₹0.",
    category: "billing",
  },

  // ── Account ──
  {
    question: "How do I reset my password?",
    keywords: ["password", "reset", "forgot", "change", "login"],
    answer: "Go to the Login page → Click \"Forgot password?\" → Enter your email → Check your inbox for a reset link → Set a new password. The link expires after 1 hour.",
    category: "account",
  },
  {
    question: "How do I delete my account?",
    keywords: ["delete", "account", "remove", "erase", "gdpr"],
    answer: "Email support@eventpix.in from your registered email requesting account deletion. We'll permanently delete all your data (events, photos, face embeddings) within 30 days.",
    category: "account",
  },
  {
    question: "Is my data secure?",
    keywords: ["secure", "security", "safe", "hack", "breach", "encryption"],
    answer: "Yes! We use TLS 1.3 encryption, Row-Level Security for data isolation, and all our providers (Supabase, AWS, Cloudflare, Vercel) are SOC 2 compliant. Passwords are hashed with bcrypt. We never store credit card data.",
    category: "account",
  },

  // ── Troubleshooting ──
  {
    question: "Photos aren't loading",
    keywords: ["loading", "broken", "not showing", "blank", "error", "slow"],
    answer: "Try these steps: 1) Refresh the page, 2) Check your internet connection, 3) If you're using Google Drive BYOC, verify the Drive files are still accessible, 4) Clear browser cache. If the issue persists, contact support.",
    category: "troubleshooting",
  },
  {
    question: "Face indexing is failing",
    keywords: ["index", "indexing", "fail", "stuck", "error", "process"],
    answer: "Check that: 1) Photos are in JPEG/PNG/WebP format, 2) Photos are at least 640px resolution, 3) You have a stable internet connection. Large batches may take a few minutes. Contact support if it continues to fail.",
    category: "troubleshooting",
  },
  {
    question: "QR code won't scan",
    keywords: ["qr", "scan", "code", "camera"],
    answer: "Make sure: 1) The QR code is printed at least 3x3 cm, 2) The surface is flat and well-lit, 3) Use the phone's native camera app (not a third-party scanner). Most modern phones support QR scanning natively.",
    category: "troubleshooting",
  },
];

const GREETING_KEYWORDS = ["hi", "hello", "hey", "help", "support"];

export function findBestAnswer(query: string): QA | null {
  const lower = query.toLowerCase().trim();

  // Check for greetings
  if (GREETING_KEYWORDS.some((g) => lower === g || lower === g + "!")) {
    return null; // Return null to trigger greeting response
  }

  // Score each QA by keyword matches
  let bestMatch: QA | null = null;
  let bestScore = 0;

  for (const qa of chatbotKnowledge) {
    let score = 0;

    // Check keywords
    for (const kw of qa.keywords) {
      if (lower.includes(kw)) {
        score += 2;
      }
    }

    // Check question similarity (bonus for question word overlap)
    const questionWords = qa.question.toLowerCase().split(/\s+/);
    const queryWords = lower.split(/\s+/);
    for (const qw of queryWords) {
      if (qw.length > 2 && questionWords.includes(qw)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = qa;
    }
  }

  // Require minimum score to avoid poor matches
  return bestScore >= 2 ? bestMatch : null;
}

export const suggestedQuestions = [
  "How do I create an event?",
  "How does face recognition work?",
  "What are the pricing plans?",
  "Is my selfie stored?",
  "How do I share with guests?",
];
