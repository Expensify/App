import useAppState from '@hooks/useAppState';

import {useEffect, useRef, useState} from 'react';

/**
 * Returns a value that changes every time the app comes back to the foreground after being
 * backgrounded. Pass it as a `key` on a component that owns a Skia `Canvas` to force a fresh mount.
 *
 * Android destroys the `TextureView` surface backing a Skia canvas when the activity is stopped. The
 * surface is recreated on resume, but nothing pushes a new picture into it, so the canvas comes back
 * blank (upstream: https://github.com/Shopify/react-native-skia/issues/2135). Chart props are static,
 * so React never re-renders and the canvas is never asked to repaint — remounting is what restores it.
 * `src/components/Lottie/index.tsx` uses the same workaround for the same class of bug.
 *
 * Only a full `background` transition counts. iOS reports a transient `inactive` state for things like
 * pulling down the notification shade, and remounting the canvas on those would churn it for no reason.
 */
function useSkiaCanvasRemountKey(): number {
    const {isBackground} = useAppState();
    const [remountKey, setRemountKey] = useState(0);
    const hasBeenBackgroundedRef = useRef(false);

    useEffect(() => {
        if (isBackground) {
            hasBeenBackgroundedRef.current = true;
            return;
        }

        if (!hasBeenBackgroundedRef.current) {
            return;
        }

        hasBeenBackgroundedRef.current = false;
        setRemountKey((previousKey) => previousKey + 1);
    }, [isBackground]);

    return remountKey;
}

export default useSkiaCanvasRemountKey;
