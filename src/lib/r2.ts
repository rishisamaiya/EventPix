import { S3Client, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

// Generate a presigned URL for direct browser → R2 upload (avoids routing through server)
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 300
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}

// Public URL for a stored object
export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

// Build the R2 key for a photo
// Format: events/{eventId}/{photoId}/{filename}
export function buildPhotoKey(eventId: string, photoId: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  return `events/${eventId}/${photoId}.${ext}`;
}

// Delete a photo from R2
export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
