'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, Loader2 } from 'lucide-react';
import { getCroppedImageBlob, mimeToExtension } from '@/lib/cropImage';

/**
 * Full-screen crop step before upload. Export uses the crop box size in original image pixels (no resize).
 */
export default function ImageCropModal({
  open,
  imageSrc,
  title = 'Crop image',
  aspect,
  mimeType = 'image/jpeg',
  outputQuality = 0.98,
  originalFileName = 'image.jpg',
  onClose,
  onComplete,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [open, imageSrc]);

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setApplying(true);
    try {
      const blob = await getCroppedImageBlob(
        imageSrc,
        croppedAreaPixels,
        mimeType,
        outputQuality
      );
      const ext = mimeToExtension(mimeType);
      const base = (originalFileName || 'image').replace(/\.[^.]+$/, '');
      const file = new File([blob], `${base}.${ext}`, { type: mimeType });
      onComplete(file);
    } catch (e) {
      console.error(e);
    } finally {
      setApplying(false);
    }
  };

  if (!open || !imageSrc) return null;

  return (
    <div
      className="fixed inset-0 z-[240] flex flex-col bg-slate-950/95 text-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-crop-title"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-white/10 shrink-0">
        <h2 id="image-crop-title" className="text-sm font-black tracking-widest truncate">
          {title}
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={applying}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
            aria-label="Cancel crop"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={applying || !croppedAreaPixels}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold text-sm disabled:opacity-50"
          >
            {applying ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
            Apply
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-[240px]">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          {...(typeof aspect === 'number' && aspect > 0 && Number.isFinite(aspect) ? { aspect } : {})}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid
          objectFit="contain"
        />
      </div>

      <div className="px-4 py-4 border-t border-white/10 space-y-2 shrink-0 bg-slate-900/80">
        <label className="flex items-center gap-3 text-xs font-semibold text-slate-300">
          <span className="w-16 shrink-0">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-emerald-500"
          />
        </label>
        <p className="text-[11px] text-slate-500">
          Saved image matches your crop in original pixels (width × height). Zoom to include the full photo for full resolution.
        </p>
      </div>
    </div>
  );
}
