import {
  RekognitionClient,
  CreateCollectionCommand,
  DeleteCollectionCommand,
  IndexFacesCommand,
  SearchFacesByImageCommand,
  QualityFilter,
} from "@aws-sdk/client-rekognition";

const client = new RekognitionClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Rekognition collection ID derived from event UUID
// Format: eventpix-{eventId}  e.g. eventpix-849a161a-d49c-43d6-9fcb-c4783f50ac47
export function getCollectionId(eventId: string): string {
  return `eventpix-${eventId}`;
}

// In-process cache so we only call CreateCollection once per event per server instance.
// This avoids an extra AWS round-trip for every single IndexFaces call.
const _collectionCache = new Set<string>();

// Create collection for an event (idempotent — safe to call multiple times)
export async function ensureCollection(eventId: string): Promise<string> {
  const collectionId = getCollectionId(eventId);
  if (_collectionCache.has(collectionId)) return collectionId;
  try {
    await client.send(new CreateCollectionCommand({ CollectionId: collectionId }));
  } catch (err: any) {
    if (err.name !== "ResourceAlreadyExistsException") throw err;
  }
  _collectionCache.add(collectionId);
  return collectionId;
}

// Delete collection when event is deleted
export async function deleteCollection(eventId: string): Promise<void> {
  const collectionId = getCollectionId(eventId);
  try {
    await client.send(new DeleteCollectionCommand({ CollectionId: collectionId }));
  } catch (err: any) {
    if (err.name !== "ResourceNotFoundException") throw err;
  }
}

// Index faces in a photo. imageBytes = the raw photo data.
// ExternalImageId = photoId so we can map matches back to photos.
export async function indexFacesInPhoto(
  eventId: string,
  photoId: string,
  imageBytes: Uint8Array
): Promise<number> {
  const collectionId = await ensureCollection(eventId);

  const result = await client.send(
    new IndexFacesCommand({
      CollectionId: collectionId,
      Image: { Bytes: imageBytes },
      ExternalImageId: photoId,
      DetectionAttributes: [],
      MaxFaces: 25,
      QualityFilter: QualityFilter.MEDIUM,
    })
  );

  return result.FaceRecords?.length ?? 0;
}

// Search for a face in an event's collection using a selfie image.
// Returns array of { photoId, similarity } sorted by best match first.
export async function searchFacesByImage(
  eventId: string,
  imageBytes: Uint8Array,
  threshold: number = 80
): Promise<Array<{ photoId: string; similarity: number }>> {
  const collectionId = getCollectionId(eventId);

  try {
    const result = await client.send(
      new SearchFacesByImageCommand({
        CollectionId: collectionId,
        Image: { Bytes: imageBytes },
        FaceMatchThreshold: threshold,
        MaxFaces: 100,
      })
    );

    const matches = result.FaceMatches ?? [];

    // Deduplicate by photoId — keep the highest similarity per photo
    const byPhoto = new Map<string, number>();
    for (const match of matches) {
      const photoId = match.Face?.ExternalImageId;
      const similarity = match.Similarity ?? 0;
      if (photoId && (!byPhoto.has(photoId) || similarity > byPhoto.get(photoId)!)) {
        byPhoto.set(photoId, similarity);
      }
    }

    return Array.from(byPhoto.entries())
      .map(([photoId, similarity]) => ({ photoId, similarity }))
      .sort((a, b) => b.similarity - a.similarity);
  } catch (err: any) {
    // No face detected in the selfie, or collection doesn't exist yet
    if (
      err.name === "InvalidParameterException" ||
      err.name === "InvalidImageFormatException" ||
      err.name === "ResourceNotFoundException"
    ) {
      return [];
    }
    throw err;
  }
}
