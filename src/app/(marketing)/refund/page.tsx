import type { Metadata } from "next";
import { RotateCcw, CheckCircle2, Clock, AlertTriangle, HelpCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — EventPix",
  description:
    "Learn about EventPix's refund and cancellation policies for paid plans.",
};

export default function RefundPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-blue-700">
          <RotateCcw className="h-4 w-4" />
          Refund Policy
        </div>
        <h1 className="mb-4 text-4xl font-extrabold text-slate-900">
          Refund & Cancellation Policy
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-500">
          We want you to be completely satisfied with EventPix. Here's our
          straightforward refund policy.
        </p>
        <p className="mt-3 text-sm text-slate-400">
          Last updated: April 15, 2026
        </p>
      </div>

      {/* TL;DR Card */}
      <div className="mb-8 rounded-2xl border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-sky-50 p-8">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          📋 Quick Summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
              text: "Full refund within 48 hours of purchase if event hasn't been used",
            },
            {
              icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
              text: "Refund within 7 days if face recognition doesn't work for your event",
            },
            {
              icon: <Clock className="h-5 w-5 text-amber-500" />,
              text: "Refunds processed within 5-7 business days",
            },
            {
              icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
              text: "No refund if photos have been shared with guests",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
              <span className="text-sm text-slate-600">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-6">
        {/* Eligible for Refund */}
        <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Eligible for Full Refund
            </h2>
          </div>
          <ul className="space-y-3 text-slate-600">
            {[
              "You purchased a paid plan but haven't uploaded any photos or shared the event with guests, and it's within 48 hours of purchase.",
              "The AI face recognition feature consistently fails to produce results for your event (technical failure on our end), reported within 7 days.",
              "You were charged incorrectly (duplicate payment, wrong amount, etc.).",
              "A critical platform outage prevented you from using the service during your event.",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Not Eligible */}
        <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Not Eligible for Refund
            </h2>
          </div>
          <ul className="space-y-3 text-slate-600">
            {[
              "Photos have already been uploaded and shared with guests (the service has been materially consumed).",
              "The event has expired naturally (past the plan's duration).",
              "Dissatisfaction with face recognition accuracy on specific low-quality or group photos (accuracy depends on photo quality).",
              "Change of mind after the event has started and the gallery is live.",
              "Requests made more than 30 days after purchase.",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Process */}
        <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 text-white">
              <Clock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              How to Request a Refund
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Contact Us",
                desc: "Email support@eventpix.in with your registered email, event name, and reason for refund.",
              },
              {
                step: "2",
                title: "Review",
                desc: "Our team will review your request within 24 hours and may ask for additional information.",
              },
              {
                step: "3",
                title: "Processing",
                desc: "Approved refunds are processed via the original payment method within 5-7 business days.",
              },
              {
                step: "4",
                title: "Confirmation",
                desc: "You'll receive an email confirmation once the refund has been processed.",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="mt-10 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 p-8 text-center">
        <div className="mb-3 flex justify-center">
          <HelpCircle className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-slate-900">
          Need help with a refund?
        </h3>
        <p className="mb-4 text-slate-500">
          Contact us at{" "}
          <a
            href="mailto:support@eventpix.in"
            className="font-medium text-blue-600 hover:underline"
          >
            support@eventpix.in
          </a>{" "}
          or visit our{" "}
          <Link
            href="/help"
            className="font-medium text-blue-600 hover:underline"
          >
            Help Center
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
