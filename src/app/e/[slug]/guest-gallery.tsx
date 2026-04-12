"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  Check,
} from "lucide-react";
import { SelfieCapture } from "@/components/selfie-capture";

type Photo = {
  id: string;
  source_url: string;
  thumbnail_url: string | null;
  face_count: number;
};

type MatchedPhoto = Photo & { similarity?: number };

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
  const [showSelfie, setShowSelfie] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchLoadingText, setMatchLoadingText] = useState("");
  const [myPhotos, setMyPhotos] = useState<MatchedPhoto[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  function verifyPin() {
    if (pinInput === event.pin_code) {
      setPinVerified(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  }

  async function handleSelfieCapture(
    _imageData: string,
    imageElement: HTMLImageElement
  ) {
    setMatchLoading(true);
    setMatchLoadingText("Loading AI models...");

    try {
      const { loadModels, getSingleFaceDescriptor, descriptorToArray } =
        await import("@/lib/face-detection");

      await loadModels();
      setMatchLoadingText("Analyzing your face...");

      const descriptor = await getSingleFaceDescriptor(imageElement);
      if (!descriptor) {
        alert("No face detected. Please try again with a clearer selfie.");
        setMatchLoading(false);
        setShowSelfie(false);
        return;
      }

      setMatchLoadingText("Searching through event photos...");
      const embedding = descriptorToArray(descriptor);

      const response = await fetch("/api/match-faces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embedding,
          eventId: event.id,
          threshold: 0.45,
          limit: 200,
        }),
      });

      const data = await response.json();

      if (data.matches && data.matches.length > 0) {
        setMyPhotos(data.matches);
      } else {
        setMyPhotos([]);
      }

      setHasSearched(true);
      setShowSelfie(false);
      setActiveTab("my");
    } catch (err) {
      console.error("Face matching error:", err);
      alert(
        "Face matching failed. This could be because:\n" +
        "- The AI models are still loading (try again in a few seconds)\n" +
        "- Photos haven't been indexed yet (ask the event host)\n" +
        "- Poor network connection"
      );
    } finally {
      setMatchLoading(false);
    }
  }

  function togglePhotoSelection(photoId: string) {
    setSelectedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  }

  function shareViaWhatsApp() {
    const url = window.location.href;
    const text = encodeURIComponent(
      `Check out the photos from ${event.name}! Find your photos with a selfie: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  // --- PIN SCREEN ---
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

  // --- GALLERY ---
  const displayPhotos = activeTab === "official" ? photos : myPhotos;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Selfie Capture Modal */}
      {showSelfie && (
        <SelfieCapture
          onCapture={handleSelfieCapture}
          onClose={() => {
            setShowSelfie(false);
            setMatchLoading(false);
          }}
          loading={matchLoading}
          loadingText={matchLoadingText}
        />
      )}

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
          <div className="flex h-[40vh] items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
            <Camera className="h-20 w-20 text-indigo-300" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-6 text-center">
          <button
            onClick={() => {
              setShowSelfie(true);
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
          {hasSearched && activeTab === "my" && (
            <span className="flex items-center gap-1 text-primary">
              <ScanFace className="h-4 w-4" />
              {myPhotos.length} matches
            </span>
          )}
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
              if (!hasSearched) setShowSelfie(true);
            }}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === "my"
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            MY PHOTOS
            {hasSearched && myPhotos.length > 0 && (
              <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {myPhotos.length}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "my" && hasSearched && (
            <button
              onClick={() => setShowSelfie(true)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Retake selfie"
            >
              <Camera className="h-5 w-5" />
            </button>
          )}
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="px-0.5 py-0.5">
        {activeTab === "my" && !hasSearched ? (
          <div className="flex flex-col items-center py-20">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
              <ScanFace className="h-10 w-10 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Find Your Photos</h3>
            <p className="mb-6 max-w-xs text-center text-sm text-gray-500">
              Take a selfie and we&apos;ll use AI to find every photo you appear
              in — instantly.
            </p>
            <button
              onClick={() => setShowSelfie(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
            >
              <Camera className="h-5 w-5" />
              Take a Selfie
            </button>
          </div>
        ) : activeTab === "my" && hasSearched && myPhotos.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <ScanFace className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No matches found</h3>
            <p className="mb-6 max-w-xs text-center text-sm text-gray-500">
              We couldn&apos;t find you in the event photos. Try again with a
              clearer selfie.
            </p>
            <button
              onClick={() => setShowSelfie(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
            >
              <Camera className="h-5 w-5" />
              Try Again
            </button>
          </div>
        ) : displayPhotos.length > 0 ? (
          <div className="grid grid-cols-3 gap-0.5">
            {displayPhotos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => {
                  if (selectionMode) {
                    togglePhotoSelection(photo.id);
                  } else {
                    setSelectedPhoto(photo);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSelectionMode(true);
                  togglePhotoSelection(photo.id);
                }}
                className="relative aspect-square overflow-hidden bg-gray-100"
              >
                <img
                  src={photo.thumbnail_url || photo.source_url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {selectionMode && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition ${
                      selectedPhotos.has(photo.id)
                        ? "bg-primary/30"
                        : "bg-black/10"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                        selectedPhotos.has(photo.id)
                          ? "border-primary bg-primary"
                          : "border-white bg-white/50"
                      }`}
                    >
                      {selectedPhotos.has(photo.id) && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-gray-400">
            <ImageIcon className="mb-3 h-12 w-12" />
            <p>No photos uploaded yet</p>
          </div>
        )}
      </div>

      {/* Bottom Nav (Samaro-style) */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex border-t border-gray-200 bg-white">
        <button
          onClick={shareViaWhatsApp}
          className="flex flex-1 flex-col items-center gap-0.5 py-3 text-xs text-gray-500 transition hover:text-gray-900"
        >
          <Share2 className="h-5 w-5" />
          Share
        </button>
        <button
          onClick={() => {
            if (!hasSearched) {
              setShowSelfie(true);
            } else {
              setActiveTab("my");
            }
          }}
          className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition ${
            activeTab === "my"
              ? "font-medium text-primary"
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
        <button
          className="flex flex-1 flex-col items-center gap-0.5 py-3 text-xs text-gray-500 transition hover:text-gray-900"
          onClick={() => {
            if (selectedPhoto) {
              const a = document.createElement("a");
              a.href = selectedPhoto.source_url;
              a.download = "";
              a.target = "_blank";
              a.click();
            }
          }}
        >
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
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-4">
            <a
              href={selectedPhoto.source_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur hover:bg-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </div>
          <img
            src={selectedPhoto.source_url}
            alt=""
            className="max-h-[85vh] max-w-[95vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
