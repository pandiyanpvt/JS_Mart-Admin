'use client';

import { useEffect } from 'react';

const LOCK_ATTR = 'data-lock-body-scroll';

/**
 * Locks body scroll when any element with [data-lock-body-scroll] is in the DOM.
 * Use this in the main layout only. Add data-lock-body-scroll to modal overlay divs.
 */
export function useBodyScrollLockObserver() {
    useEffect(() => {
        let scrollY = 0;
        const lock = () => {
            scrollY = window.scrollY;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        };
        const unlock = () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollY);
        };
        const check = () => {
            const hasModal = document.querySelector(`[${LOCK_ATTR}]`);
            if (hasModal) lock();
            else unlock();
        };
        const observer = new MutationObserver(() => {
            check();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        check();
        return () => {
            observer.disconnect();
            unlock();
        };
    }, []);
}

/** Attribute to add to modal overlay div so body scroll is locked when modal is open */
export const BODY_SCROLL_LOCK_ATTR = LOCK_ATTR;
