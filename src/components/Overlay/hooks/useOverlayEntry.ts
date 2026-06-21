import {useEffect, useLayoutEffect, useRef} from 'react';
import {removeOverlayEntry, upsertOverlayEntry} from '@components/Overlay/libs/overlayStore';
import type {OverlayEntry} from '@components/Overlay/libs/overlayStore';

function useOverlayEntry(entry: OverlayEntry | null): void {
    const publishedIdRef = useRef<string | null>(null);

    useLayoutEffect(() => {
        if (entry !== null) {
            if (publishedIdRef.current !== null && publishedIdRef.current !== entry.id) {
                removeOverlayEntry(publishedIdRef.current);
            }
            publishedIdRef.current = entry.id;
            upsertOverlayEntry(entry);
            return;
        }
        if (publishedIdRef.current !== null) {
            removeOverlayEntry(publishedIdRef.current);
            publishedIdRef.current = null;
        }
    });

    useEffect(
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
