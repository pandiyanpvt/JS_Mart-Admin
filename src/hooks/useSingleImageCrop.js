'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * One-shot crop session: open(file, specKey) then show modal bound to target.src / target.specKey.
 */
export function useSingleImageCrop() {
  const [target, setTarget] = useState(null);
  const targetRef = useRef(null);
  targetRef.current = target;

  const open = useCallback((file, specKey) => {
    if (!file) return;
    setTarget((prev) => {
      if (prev?.src) URL.revokeObjectURL(prev.src);
      return {
        src: URL.createObjectURL(file),
        fileName: file.name || 'image.jpg',
        mime: file.type || 'image/jpeg',
        specKey,
      };
    });
  }, []);

  const close = useCallback(() => {
    setTarget((prev) => {
      if (prev?.src) URL.revokeObjectURL(prev.src);
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      const t = targetRef.current;
      if (t?.src) URL.revokeObjectURL(t.src);
    };
  }, []);

  return { target, open, close, isOpen: Boolean(target) };
}
