import imageCompression from 'browser-image-compression';
import { createClient } from './client';

const BUCKET = 'property-photos';
const MAX_WIDTH = 1920;
const COMPRESSION_QUALITY = 0.8;

async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxWidthOrHeight: MAX_WIDTH,
    maxSizeMB: 5,
    initialQuality: COMPRESSION_QUALITY,
    useWebWorker: true,
    fileType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
  });
}

function getFileExtension(file: File): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  return mimeMap[file.type] ?? 'jpg';
}

export interface UploadResult {
  storagePath: string;
  url: string;
  width: number | null;
  height: number | null;
  sizeBytes: number;
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadPropertyPhoto(
  file: File,
  propertyId: string,
): Promise<UploadResult> {
  const supabase = createClient();
  const compressed = await compressImage(file);
  const ext = getFileExtension(compressed);
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const storagePath = `${propertyId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, compressed, {
      contentType: compressed.type,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  let width: number | null = null;
  let height: number | null = null;
  try {
    const dims = await getImageDimensions(compressed);
    width = dims.width;
    height = dims.height;
  } catch {
    // dimensions are optional
  }

  return {
    storagePath,
    url: urlData.publicUrl,
    width,
    height,
    sizeBytes: compressed.size,
  };
}

export async function deletePropertyPhoto(storagePath: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) throw error;
}
