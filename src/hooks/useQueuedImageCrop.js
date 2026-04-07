'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Opens crop UI for each enqueued file in order. After apply/cancel, call finishCrop() to advance.
 */
export function useQueuedImageCrop() {
  const [queue, setQueue] = useState([]);
  const [cropSrc, setCropSrc] = useState('');
  const [cropMeta, setCropMeta] = useState({ name: 'image.jpg', mime: 'image/jpeg' });

  useEffect(() => {
    if (queue.length === 0) {
      setCropSrc((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return '';
      });
      return;
    }
    const f = queue[0];
    setCropMeta({ name: f.name || 'image.jpg', mime: f.type || 'image/jpeg' });
    setCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  }, [queue]);

  const enqueue = useCallback((files) => {
    const list = Array.isArray(files) ? files : [files];
    if (!list.length) return;
    setQueue((q) => [...q, ...list]);
  }, []);

  const finishCrop = useCallback(() => {
    setQueue((q) => q.slice(1));
  }, []);

  const cancelAllQueued = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    cropOpen: Boolean(cropSrc),
    cropSrc,
    cropFileName: cropMeta.name,
    cropMimeType: cropMeta.mime,
    enqueue,
    finishCrop,
    cancelAllQueued,
    queueLength: queue.length,
  };
}
