"use client";

import { useState } from "react";
import {
  Share2,
  ScanFace,
  Lock,
  Download,
  Camera,
  ChevronDown,
  Search,
  X,
  ImageIcon,
} from "lucide-react";

type Photo = {
  id: string;
  source_url: string;
  thumbnail_url: string | null;
  face_count: number;
};

type Event = {
  id: string;
  name: string;
  event_date: string | null;
  cover_url: string | null;
  pin_code: string | null;
  photo_count: number;
  allow_download: boolean;
};

export function GuestGallery({
  event,
  photos,
}: {
  event: Event;
  photos: Photo[];
}) {
  const [activeTab, setActiveTab] = useState<"official" | "my">("official");
  const [pinVerified, setPinVerified] = useState(!event.pin_code);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [showSelfiePrompt, setShowSelfiePrompt] = useState(false);
  const [myPhotos, setMyPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  function verifyPin() {
    if (pinInput === event.pin_code) {
      setPinVerified(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  }

  if (!pinVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-2 text-xl font-bold text-white">{event.name}</h1>
          <p className="mb-8 text-sm text-white/60">
            Enter the PIN to access this gallery
          </p>
          <input
            type="text"
            inputMode="numeric"
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6));
              setPinError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && verifyPin()}
            placeholder="Enter PIN"
            className={`mb-4 w-full rounded-xl border bg-white/10 px-4 py-3.5 text-center text-2xl tracking-[0.5em] text-white placeholder:text-white/30 placeholder:tracking-normal placeholder:text-base outline-none ${
              pinError ? "border-red-500" : "border-white/20"
            }`}
          />
          {pinError && (
            <p className="mb-4 text-sm text-red-400">
              Incorrect PIN. Please try again.
            </p>
          )}
          <button
            onClick={verifyPin}
            className="w-full rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/90"
          >
            Enter Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero / Cover */}
      <div className="relative">
        {event.cover_url ? (
          <div className="relative h-[50vh] w-full">
            <img
              src={event.cover_url}
              alt={event.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="flex h-[40vh] items-center justify-center bg-gradient-to-br from-primary/20 via-accent to-primary/10">
            <Camera className="h-20 w-20 text-primary/30" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-6 text-center">
          <button
            onClick={() => {
              setActiveTab("my");
              setShowSelfiePrompt(true);
            }}
            className="mb-4 inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/20 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/30"
          >
            <ScanFace className="h-5 w-5" />
            MY PHOTOS
          </button>
        </div>
      </div>

      {/* Event Info */}
      <div className="border-b border-gray-100 py-6 text-center">
        <h1 className="text-xl font-bold uppercase tracking-wider text-gray-900">
          {event.name}
        </h1>
        <div className="mt-2 flex items-center justify-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <ImageIcon className="h-4 w-4" />
            {event.photo_count} Photos
          </span>
        </div>
        <div className="mt-2">
          <ChevronDown className="mx-auto h-6 w-6 animate-bounce text-gray-300" />
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4">
        <div className="flex">
          <button
            onClick={() => setActiveTab("official")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === "official"
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            OFFICIAL
          </button>
          <button
            onClick={() => {
              setActiveTab("my");
              if (myPhotos.length === 0) setShowSelfiePrompt(true);
            }}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === "my"
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            MY PHOTOS
          </button>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="px-1 py-1">
        {activeTab === "official" ? (
          photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-0.5">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative aspect-square overflow-hidden bg-gray-100"
                >
                  <img
                    src={photo.thumbnail_url || photo.source_url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <ImageIcon className="mb-3 h-12 w-12" />
              <p>No photos uploaded yet</p>
            </div>
          )
        ) : showSelfiePrompt ? (
          <div className="flex flex-col items-center py-20">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <ScanFace className="h-10 w-10 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Find Your Photos</h3>
            <p className="mb-6 max-w-xs text-center text-sm text-gray-500">
              Take a selfie and we&apos;ll use AI to find every photo you appear
              in.
            </p>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
              onClick={() => {
                // Face recognition will be implemented in Phase 3
                alert("Face recognition coming soon! We're building this feature.");
              }}
            >
              <Camera className="h-5 w-5" />
              Take a Selfie
            </button>
          </div>
        ) : myPhotos.length > 0 ? (
          <div className="grid grid-cols-3 gap-0.5">
            {myPhotos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-square overflow-hidden bg-gray-100"
              >
                <img
                  src={photo.thumbnail_url || photo.source_url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Bottom Nav (Samaro-style) */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex border-t border-gray-200 bg-white">
        <button className="flex flex-1 flex-col items-center gap-0.5 py-3 text-xs text-gray-500 transition hover:text-gray-900">
          <Share2 className="h-5 w-5" />
          Share
        </button>
        <button
          onClick={() => {
            setActiveTab("my");
            if (myPhotos.length === 0) setShowSelfiePrompt(true);
          }}
          className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition ${
            activeTab === "my"
              ? "text-primary font-medium"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <ScanFace className="h-5 w-5" />
          My Photos
        </button>
        <button className="flex flex-1 flex-col items-center gap-0.5 py-3 text-xs text-gray-500 transition hover:text-gray-900">
          <Lock className="h-5 w-5" />
          Private
        </button>
        <button className="flex flex-1 flex-col items-center gap-0.5 py-3 text-xs text-gray-500 transition hover:text-gray-900">
          <Download className="h-5 w-5" />
          Download
        </button>
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selectedPhoto.source_url}
            alt=""
            className="max-h-[90vh] max-w-[95vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
