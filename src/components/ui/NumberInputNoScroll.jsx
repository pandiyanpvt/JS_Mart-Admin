'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Number input where the mouse wheel does not step the value
 * (avoids accidental changes while scrolling the page).
 */
export default function NumberInputNoScroll({ className, ...props }) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const onWheel = (e) => e.preventDefault();
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    return <input ref={ref} type="number" className={cn(className)} {...props} />;
}
