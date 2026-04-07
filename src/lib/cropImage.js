/**
 * Canvas helpers for react-easy-crop: turn cropped pixels into a Blob/File.
 * Export size always matches the crop rectangle in source pixels (no downscaling).
 */

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (e) => reject(e));
    if (!url.startsWith('blob:') && !url.startsWith('data:')) {
      image.setAttribute('crossOrigin', 'anonymous');
    }
    image.src = url;
  });
}

/**
 * @param {string} imageSrc - Object URL or data URL
 * @param {{ x: number; y: number; width: number; height: number }} pixelCrop - from react-easy-crop onCropComplete (natural image pixels)
 * @param {string} mimeType
 * @param {number} quality - JPEG/WebP quality 0..1 (ignored for PNG)
 */
export async function getCroppedImageBlob(
  imageSrc,
  pixelCrop,
  mimeType = 'image/jpeg',
  quality = 0.98
) {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const outW = Math.max(1, Math.round(pixelCrop.width));
  const outH = Math.max(1, Math.round(pixelCrop.height));
  canvas.width = outW;
  canvas.height = outH;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outW,
    outH
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Crop failed'));
        else resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export function mimeToExtension(mimeType) {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  return 'jpg';
}

/** Prefer PNG/WebP when the source file uses them; otherwise JPEG for size. */
export function pickOutputMime(originalMime) {
  if (originalMime === 'image/png') return 'image/png';
  if (originalMime === 'image/webp') return 'image/webp';
  return 'image/jpeg';
}
