"use client";

import { useState, useEffect } from "react";
import {
  FolderOpen,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ImageIcon,
  CloudOff,
  HardDrive,
  ScanFace,
} from "lucide-react";

type DriveFolder = {
  id: string;
  name: string;
  modifiedTime: string;
};

type DrivePhoto = {
  drive_file_id: string;
  name: string;
  mime_type: string;
  size: number;
  width?: number;
  height?: number;
  thumbnail_url: string;
  source_url: string;
};

interface GoogleDrivePickerProps {
  eventId: string;
  isConnected: boolean;
  onImportComplete: () => void;
}

export function GoogleDrivePicker({
  eventId,
  isConnected,
  onImportComplete,
}: GoogleDrivePickerProps) {
  const [connecting, setConnecting] = useState(false);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<DriveFolder | null>(null);
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number } | null>(null);

  useEffect(() => {
    if (isConnected) {
      loadFolders();
    }
  }, [isConnected]);

  async function connectGoogleDrive() {
    setConnecting(true);
    try {
      const res = await fetch("/api/google-drive/auth-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start Google auth");
        setConnecting(false);
      }
    } catch {
      alert("Failed to connect. Check that Google OAuth is configured.");
      setConnecting(false);
    }
  }

  async function loadFolders() {
    setLoadingFolders(true);
    try {
      const res = await fetch("/api/google-drive/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (data.folders) {
        setFolders(data.folders);
      }
    } catch {
      console.error("Failed to load folders");
    }
    setLoadingFolders(false);
  }

  async function loadPhotos(folderId: string, append = false) {
    setLoadingPhotos(true);
    try {
      const res = await fetch("/api/google-drive/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          folderId,
          pageToken: append ? nextPageToken : undefined,
        }),
      });
      const data = await res.json();
      if (data.photos) {
        setPhotos((prev) => (append ? [...prev, ...data.photos] : data.photos));
        setNextPageToken(data.nextPageToken || null);
      }
    } catch {
      console.error("Failed to load photos");
    }
    setLoadingPhotos(false);
  }

  async function importPhotos() {
    if (photos.length === 0) return;
    setImporting(true);

    try {
      const batchSize = 50;
      let totalImported = 0;

      for (let i = 0; i < photos.length; i += batchSize) {
        const batch = photos.slice(i, i + batchSize);
        const res = await fetch("/api/google-drive/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, photos: batch }),
        });
        const data = await res.json();
        totalImported += data.imported || 0;
      }

      setImportResult({ count: totalImported });
      onImportComplete();
    } catch {
      alert("Failed to import photos");
    }
    setImporting(false);
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="rounded-xl border border-border p-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <HardDrive className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="mb-1 font-semibold">Connect Google Drive</h3>
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">
            Link your Google Drive to import event photos. Photos stay in your
            Drive — we only index faces for matching.
          </p>
          <button
            onClick={connectGoogleDrive}
            disabled={connecting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {connecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <HardDrive className="h-4 w-4" />
            )}
            {connecting ? "Connecting..." : "Connect Google Drive"}
          </button>
        </div>
      </div>
    );
  }

  // Import complete state
  if (importResult) {
    return (
      <div className="rounded-xl border border-border p-6">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="mb-3 h-12 w-12 text-green-600" />
          <h3 className="mb-1 font-semibold">
            {importResult.count} Photos Imported!
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Photos are linked from your Google Drive. Now index faces below.
          </p>
        </div>
      </div>
    );
  }

  // Folder browser
  if (!selectedFolder) {
    return (
      <div className="rounded-xl border border-border p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Google Drive Connected</h3>
          </div>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Connected
          </span>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Select the folder containing your event photos:
        </p>

        {loadingFolders ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : folders.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <CloudOff className="mb-2 h-8 w-8" />
            <p className="text-sm">No folders found in your Drive</p>
          </div>
        ) : (
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => {
                  setSelectedFolder(folder);
                  loadPhotos(folder.id);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-muted"
              >
                <FolderOpen className="h-5 w-5 text-yellow-500" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{folder.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(folder.modifiedTime).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Photo browser within folder
  return (
    <div className="rounded-xl border border-border p-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => {
            setSelectedFolder(null);
            setPhotos([]);
            setNextPageToken(null);
          }}
          className="flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to folders
        </button>
        <span className="text-sm text-muted-foreground">
          {photos.length} photos found
        </span>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <FolderOpen className="h-5 w-5 text-yellow-500" />
        <h3 className="font-semibold">{selectedFolder.name}</h3>
      </div>

      {loadingPhotos && photos.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8">
            {photos.map((photo, i) => (
              <div
                key={photo.drive_file_id || i}
                className="aspect-square overflow-hidden rounded-md bg-muted"
              >
                <img
                  src={photo.thumbnail_url}
                  alt={photo.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>

          {nextPageToken && (
            <button
              onClick={() => loadPhotos(selectedFolder.id, true)}
              disabled={loadingPhotos}
              className="mb-4 w-full rounded-lg border border-border py-2 text-sm font-medium transition hover:bg-muted"
            >
              {loadingPhotos ? "Loading more..." : "Load More Photos"}
            </button>
          )}

          {photos.length > 0 && (
            <button
              onClick={importPhotos}
              disabled={importing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
              {importing
                ? "Importing..."
                : `Import ${photos.length} Photos from Drive`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
