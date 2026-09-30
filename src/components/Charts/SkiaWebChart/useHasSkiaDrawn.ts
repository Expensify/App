import type {RefObject} from 'react';

import {useEffect, useState} from 'react';

/** Dispatched by the patched Skia web renderer after it first draws a picture onto its canvas. */
const FIRST_DRAW_EVENT = 'skia-first-draw';

function useHasSkiaDrawn(containerRef: RefObject<HTMLElement | null>): boolean {
    const [hasDrawn, setHasDrawn] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!(container instanceof HTMLElement)) {
            return;
        }
        const markDrawn = () => setHasDrawn(true);
        container.addEventListener(FIRST_DRAW_EVENT, markDrawn);
        return () => container.removeEventListener(FIRST_DRAW_EVENT, markDrawn);
    }, [containerRef]);

    return hasDrawn;
}

export default useHasSkiaDrawn;
