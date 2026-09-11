import type {RefObject} from 'react';

import {useEffect, useState} from 'react';

/** Dispatched by the patched Skia web renderer when it cannot create any drawing surface (see `patches/@shopify/react-native-skia`). */
const SURFACE_UNAVAILABLE_EVENT = 'skia-surface-unavailable';

/**
 * True once a Skia renderer inside the container has reported that it cannot create a drawing surface.
 *
 * The capability probe can pass while creating the actual surface still fails: the surface is created only
 * once the CanvasKit WASM module has loaded, and WebGL can become exhausted in between. Only the renderer
 * knows when that happens, so it announces the failure with a bubbling event and this hook listens for it.
 */
function useIsSkiaSurfaceUnavailable(containerRef: RefObject<HTMLElement | null>): boolean {
    const [isSurfaceUnavailable, setIsSurfaceUnavailable] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        // Outside the browser the ref does not hold a DOM element and the event can never fire.
        if (!(container instanceof HTMLElement)) {
            return;
        }
        const markSurfaceUnavailable = () => setIsSurfaceUnavailable(true);
        container.addEventListener(SURFACE_UNAVAILABLE_EVENT, markSurfaceUnavailable);
        return () => container.removeEventListener(SURFACE_UNAVAILABLE_EVENT, markSurfaceUnavailable);
    }, [containerRef]);

    return isSurfaceUnavailable;
}

export default useIsSkiaSurfaceUnavailable;
