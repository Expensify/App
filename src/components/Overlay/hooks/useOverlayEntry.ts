import {removeOverlayEntry, upsertOverlayEntry} from '@components/Overlay/libs/overlayStore';
import type {OverlayEntry} from '@components/Overlay/libs/overlayStore';

import useCallbackRef from '@hooks/useCallbackRef';

import {useLayoutEffect, useRef} from 'react';

const NOOP_CLOSE = () => {};

function useOverlayEntry(entry: OverlayEntry | null): void {
    const publishedIdRef = useRef<string | null>(null);

    // Stable so the store's ref-equality check doesn't churn on consumer-identity changes.
    const stableClose = useCallbackRef(entry?.close ?? NOOP_CLOSE);

    useLayoutEffect(() => {
        if (entry !== null) {
            if (publishedIdRef.current !== null && publishedIdRef.current !== entry.id) {
                removeOverlayEntry(publishedIdRef.current);
            }
            publishedIdRef.current = entry.id;
            upsertOverlayEntry({...entry, close: stableClose});
            return;
        }
        if (publishedIdRef.current !== null) {
            removeOverlayEntry(publishedIdRef.current);
            publishedIdRef.current = null;
        }
    }, [entry, stableClose]);

    useLayoutEffect(
        () => () => {
            if (publishedIdRef.current === null) {
                return;
            }
            removeOverlayEntry(publishedIdRef.current);
            publishedIdRef.current = null;
        },
        [],
    );
}

export default useOverlayEntry;
