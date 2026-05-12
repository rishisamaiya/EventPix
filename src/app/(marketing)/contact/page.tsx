"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageCircle, Send, CheckCircle2, Mail, User, FileText,
} from "lucide-react";

const subjects = [
  "General Inquiry",
  "Technical Support",
  "Billing & Payments",
  "Face Recognition Issue",
  "Feature Request",
  "Bug Report",
  "Account Deletion",
  "Partnership / Business",
  "Other",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: subjects[0],
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/support/create-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900">
            Message Sent!
          </h1>
          <p className="mb-6 text-slate-500">
            Thank you for reaching out. Our team will review your message and
            get back to you within 24 hours at{" "}
            <strong>{formData.email}</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/help"
              className="rounded-xl border border-blue-200 bg-white px-6 py-2.5 font-semibold text-slate-700 transition hover:bg-blue-50"
            >
              Browse Help Center
            </Link>
            <Link
              href="/"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-sky-400 px-6 py-2.5 font-semibold text-white transition hover:from-blue-600 hover:to-sky-500"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-blue-700">
          <MessageCircle className="h-4 w-4" />
          Contact Us
        </div>
        <h1 className="mb-4 text-4xl font-extrabold text-slate-900">
          Get in Touch
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-500">
          Have a question, feedback, or need help? We&apos;d love to hear from
          you. Our team typically responds within 24 hours.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact Info */}
        <div className="space-y-4">
          {[
            {
              icon: <Mail className="h-5 w-5" />,
              label: "Email",
              value: "support@eventpix.in",
              href: "mailto:support@eventpix.in",
            },
            {
              icon: <MessageCircle className="h-5 w-5" />,
              label: "Response Time",
              value: "Within 24 hours",
              href: null,
            },
            {
              icon: <FileText className="h-5 w-5" />,
              label: "Help Center",
              value: "Browse FAQs →",
              href: "/help",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-blue-100 bg-white p-5"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                {item.icon}
              </div>
              <h3 className="mb-1 font-semibold text-slate-900">
                {item.label}
              </h3>
              {item.href ? (
                <a
                  href={item.href}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {item.value}
                </a>
              ) : (
                <p className="text-sm text-slate-500">{item.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <User className="h-4 w-4 text-slate-400" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Mail className="h-4 w-4 text-slate-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Subject
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Describe your question or issue in detail..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-sky-400 py-3 font-semibold text-white shadow-lg shadow-blue-200/50 transition hover:from-blue-600 hover:to-sky-500 disabled:opacity-50"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
