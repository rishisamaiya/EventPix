"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, RotateCcw, Loader2, ScanFace, X } from "lucide-react";

interface SelfieCaptureProps {
  onCapture: (imageData: string, imageElement: HTMLImageElement) => void;
  onClose: () => void;
  loading?: boolean;
  loadingText?: string;
}

export function SelfieCapture({
  onCapture,
  onClose,
  loading = false,
  loadingText = "Finding your photos...",
}: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setCameraError(
        "Camera access denied. Please allow camera access and try again."
      );
    }
  }, [facingMode, stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  function takeSelfie() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    if (facingMode === "user") {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCaptured(dataUrl);

    stream?.getTracks().forEach((t) => t.stop());
  }

  function retake() {
    setCaptured(null);
    startCamera();
  }

  function confirmSelfie() {
    if (!captured) return;

    const img = new Image();
    img.onload = () => onCapture(captured, img);
    img.src = captured;
  }

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onClose} className="rounded-full p-2 text-white/80 hover:text-white">
          <X className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2 text-white">
          <ScanFace className="h-5 w-5" />
          <span className="text-sm font-medium">Take a Selfie</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Camera / Preview */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-white">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm">{loadingText}</p>
          </div>
        ) : cameraError ? (
          <div className="px-8 text-center text-white">
            <ScanFace className="mx-auto mb-4 h-16 w-16 text-white/40" />
            <p className="mb-4 text-sm text-white/70">{cameraError}</p>
            <button
              onClick={startCamera}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
            >
              Try Again
            </button>
          </div>
        ) : captured ? (
          <img
            src={captured}
            alt="Selfie preview"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-h-full max-w-full object-contain"
              style={facingMode === "user" ? { transform: "scaleX(-1)" } : {}}
            />
            {/* Face guide overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-64 w-52 rounded-full border-2 border-dashed border-white/40" />
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 pb-10 pt-6">
        {!captured && !loading && !cameraError && (
          <>
            <button
              onClick={() =>
                setFacingMode((prev) =>
                  prev === "user" ? "environment" : "user"
                )
              }
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={takeSelfie}
              className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20 transition hover:bg-white/30"
            >
              <Camera className="h-8 w-8 text-white" />
            </button>
            <div className="w-12" />
          </>
        )}

        {captured && !loading && (
          <>
            <button
              onClick={retake}
              className="rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/20"
            >
              Retake
            </button>
            <button
              onClick={confirmSelfie}
              className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Find My Photos
            </button>
          </>
        )}
      </div>

      <p className="pb-4 text-center text-xs text-white/40">
        Your selfie is processed locally and never stored
      </p>
    </div>
  );
}
