import { google } from "googleapis";

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  );
}

export function getAuthUrl(eventId: string) {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive.readonly"],
    state: eventId,
  });
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export function getDriveClient(accessToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth: oauth2Client });
}

export async function listFolders(accessToken: string) {
  const drive = getDriveClient(accessToken);
  const res = await drive.files.list({
    q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: "files(id, name, modifiedTime)",
    orderBy: "modifiedTime desc",
    pageSize: 50,
  });
  return res.data.files ?? [];
}

export async function listPhotosInFolder(
  accessToken: string,
  folderId: string,
  pageToken?: string
) {
  const drive = getDriveClient(accessToken);
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields:
      "nextPageToken, files(id, name, mimeType, size, imageMediaMetadata, thumbnailLink, webContentLink)",
    orderBy: "createdTime desc",
    pageSize: 100,
    pageToken,
  });
  return {
    files: res.data.files ?? [],
    nextPageToken: res.data.nextPageToken,
  };
}

export async function getPhotoDownloadUrl(
  accessToken: string,
  fileId: string
) {
  const drive = getDriveClient(accessToken);
  const res = await drive.files.get(
    { fileId, fields: "webContentLink, thumbnailLink" },
  );
  return {
    downloadUrl: res.data.webContentLink,
    thumbnailUrl: res.data.thumbnailLink,
  };
}

export function getDriveThumbnailUrl(fileId: string, size: number = 400) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

export function getDriveImageProxyUrl(fileId: string) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
