const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

export function isCloudinaryConfigured() {
  return Boolean(cloudName && uploadPreset);
}

export async function uploadImage(file: File): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Photo upload is not configured. Add VITE_CLOUDINARY_UPLOAD_PRESET to .env.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Upload failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  if (!data.secure_url) {
    throw new Error('Upload succeeded but no image URL was returned.');
  }
  return data.secure_url as string;
}
