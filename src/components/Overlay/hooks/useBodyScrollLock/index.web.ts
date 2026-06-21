import {useEffect} from 'react';

let lockCount = 0;
let saved: {bodyOverflow: string; bodyPosition: string; bodyTop: string; bodyWidth: string; documentOverflow: string; scrollY: number} | null = null;

function isIOS(): boolean {
    if (typeof navigator === 'undefined') {
        return false;
    }
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) {
        return true;
    }
    return navigator.maxTouchPoints > 1 && /Macintosh/.test(ua);
}

function acquire(): void {
    if (lockCount === 0 && typeof document !== 'undefined') {
        const {body, documentElement} = document;
        saved = {
            bodyOverflow: body.style.overflow,
            bodyPosition: body.style.position,
            bodyTop: body.style.top,
            bodyWidth: body.style.width,
            documentOverflow: documentElement.style.overflow,
            scrollY: window.scrollY,
        };
        if (isIOS()) {
            body.style.position = 'fixed';
            body.style.top = `-${saved.scrollY}px`;
            body.style.width = '100%';
        }
        body.style.overflow = 'hidden';
        documentElement.style.overflow = 'hidden';
    }
    lockCount += 1;
}

function release(): void {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0 && saved !== null && typeof document !== 'undefined') {
        const {body, documentElement} = document;
        body.style.overflow = saved.bodyOverflow;
        body.style.position = saved.bodyPosition;
        body.style.top = saved.bodyTop;
        body.style.width = saved.bodyWidth;
        documentElement.style.overflow = saved.documentOverflow;
        if (isIOS()) {
            window.scrollTo(0, saved.scrollY);
        }
        saved = null;
    }
}

function useBodyScrollLock(isActive: boolean): void {
    useEffect(() => {
        if (!isActive) {
            return undefined;
        }
        acquire();
        return release;
    }, [isActive]);
}

export default useBodyScrollLock;
