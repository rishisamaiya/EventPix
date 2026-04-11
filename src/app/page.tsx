import Link from "next/link";
import {
  Camera,
  Share2,
  Lock,
  Sparkles,
  ArrowRight,
  ScanFace,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Camera className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">EventPix</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/30 via-background to-background" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-Powered Face Recognition
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Your event photos,
            <br />
            <span className="text-primary">found instantly</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Share thousands of event photos with guests. They take one selfie
            and instantly find every photo they appear in. No downloads, no
            scrolling — just magic.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
            >
              Create Your Event
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-3.5 text-base font-semibold transition hover:bg-secondary"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps. That&apos;s it.
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              From upload to delivery in minutes, not hours.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <StepCard
              step="01"
              icon={<Camera className="h-6 w-6" />}
              title="Connect Photos"
              description="Link your Google Drive or upload directly. We index faces automatically — you don't lift a finger."
            />
            <StepCard
              step="02"
              icon={<Share2 className="h-6 w-6" />}
              title="Share the Link"
              description="Send a link or QR code via WhatsApp. Guests open it — no app download, no sign-up required."
            />
            <StepCard
              step="03"
              icon={<ScanFace className="h-6 w-6" />}
              title="Selfie to Find"
              description="Guests take one selfie and instantly see every photo they appear in. Download, share, done."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/50 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<ScanFace className="h-5 w-5" />}
              title="Face Recognition"
              description="AI identifies faces across thousands of photos. Works with groups, candids, and low light."
            />
            <FeatureCard
              icon={<Share2 className="h-5 w-5" />}
              title="WhatsApp Sharing"
              description="Share your event gallery with a single WhatsApp message. Guests click and view — that simple."
            />
            <FeatureCard
              icon={<Lock className="h-5 w-5" />}
              title="PIN Protection"
              description="Keep your event private with a PIN code. Only invited guests can access the gallery."
            />
            <FeatureCard
              icon={<Camera className="h-5 w-5" />}
              title="Google Drive BYOC"
              description="Photos stay in your Google Drive. No upload limits, no storage costs. We just index the faces."
            />
            <FeatureCard
              icon={<Sparkles className="h-5 w-5" />}
              title="Instant Delivery"
              description="Guests find their photos in under 2 seconds. No waiting, no manual tagging."
            />
            <FeatureCard
              icon={<ArrowRight className="h-5 w-5" />}
              title="Free to Start"
              description="Create your first event completely free. No credit card, no trial — just start sharing."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to share your event photos?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Create your first event in under 2 minutes. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} EventPix. Built for moments that
          matter.
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-border bg-card p-8 transition hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Step {step}
      </div>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 transition hover:border-primary/30">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-1.5 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
