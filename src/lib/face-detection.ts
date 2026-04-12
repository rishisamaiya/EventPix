import * as faceapi from "@vladmandic/face-api";

let modelsLoaded = false;

const MODEL_CDN = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

export async function loadModels() {
  if (modelsLoaded) return;

  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_CDN),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_CDN),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_CDN),
  ]);

  modelsLoaded = true;
}

export async function detectFaces(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
) {
  if (!modelsLoaded) await loadModels();

  const detections = await faceapi
    .detectAllFaces(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  return detections;
}

export async function getSingleFaceDescriptor(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  if (!modelsLoaded) await loadModels();

  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection?.descriptor ?? null;
}

export function descriptorToArray(descriptor: Float32Array): number[] {
  return Array.from(descriptor);
}

export function formatEmbeddingForPgvector(descriptor: Float32Array): string {
  return `[${Array.from(descriptor).join(",")}]`;
}
