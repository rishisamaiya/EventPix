"use client";

import Link from "next/link";
import { useState } from "react";
import { Camera, CheckCircle2, Eye, EyeOff, MessageSquare, Phone, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { requestSignupOTP, finalizeSignup } from "./actions";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20";

type SignupStep = "info" | "otp";

export default function SignupPage() {
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI State
  const [step, setStep] = useState<SignupStep>("info");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const supabase = createClient();

  // Password matching logic
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  /**
   * STEP 1: Request OTP via WhatsApp Gateway
   */
  async function handleRequestOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    // Simple phone validation
    if (phone.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    
    const result = await requestSignupOTP(phone);
    
    if (result.success) {
      setStep("otp");
    } else {
      setError(result.error || "Failed to send OTP. Please try again.");
    }
    
  const router = useRouter();

  /**
   * STEP 2: Verify OTP and Finalize Signup
   */
  async function handleFinalizeSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await finalizeSignup({
      name,
      email,
      phone,
      password,
      otp
    });

    if (result.success && result.redirect) {
      router.push(result.redirect);
    } else {
      setError(result.error || "Signup failed. Please try again.");
      setLoading(false);
    }
  }

  // ── Email sent confirmation screen ──────────────────────────────────────
  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Check your email</h1>
          <p className="mb-1 text-muted-foreground">We sent a confirmation link to</p>
          <p className="mb-6 font-semibold text-foreground">{email}</p>
          <div className="rounded-2xl border border-border bg-card p-6 text-left shadow-sm">
            <p className="mb-3 text-sm font-medium text-foreground">One last step:</p>
            <p className="text-sm text-muted-foreground">Click the confirmation link in your email to activate your account. Your phone number <strong>{phone}</strong> has been verified.</p>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">Return to Login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Camera className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">EventPix</span>
          </Link>
          <h1 className="text-xl font-bold mt-2">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start sharing event photos in seconds.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {error && (
            <div className="mb-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === "info" ? (
            /* --- STEP 1: Basic Info & Phone --- */
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="Anurag Samaiya"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">WhatsApp Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    className={inputClass + " pl-12"}
                    placeholder="9876543210"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Verification code will be sent to this number.</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className={inputClass + " pr-10"}
                    placeholder="Min 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Confirm Password</label>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`${inputClass} ${passwordsMismatch ? 'border-red-500' : ''}`}
                  placeholder="Re-enter password"
                />
              </div>

              <button
                type="submit"
                disabled={loading || passwordsMismatch}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 mt-2"
              >
                {loading ? "Sending..." : "Verify Phone & Signup"}
                <MessageSquare size={16} />
              </button>
            </form>
          ) : (
            /* --- STEP 2: OTP Verification --- */
            <form onSubmit={handleFinalizeSignup} className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone size={24} />
                </div>
                <h2 className="text-lg font-bold">Verify your phone</h2>
                <p className="text-sm text-muted-foreground px-2">
                  We sent a 6-digit code to <strong>+91 {phone}</strong> via WhatsApp.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  autoFocus
                  className="w-full text-center text-2xl font-bold tracking-[0.5em] rounded-lg border border-border bg-background px-3.5 py-3 outline-none focus:border-primary"
                  placeholder="000000"
                />
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Confirm & Create Account"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep("info")}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                >
                  <ArrowLeft size={14} />
                  Change number
                </button>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Didn't get the code? <button type="button" className="text-primary font-medium hover:underline">Resend</button>
              </p>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
