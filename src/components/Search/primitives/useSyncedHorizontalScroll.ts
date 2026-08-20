// eslint-disable-next-line no-restricted-imports
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';

import {useCallback, useEffect, useLayoutEffect, useRef} from 'react';

type Listener = (offsetX: number) => void;

/** The current horizontal offset per sync key, kept outside React so a recycled scroller restores it on mount. */
const offsetsByKey = new Map<string, number>();

/** Every mounted scroller listening on a sync key, so one scroller's drag can drive its siblings. */
const listenersByKey = new Map<string, Set<Listener>>();

function getSyncedHorizontalOffset(key: string) {
    return offsetsByKey.get(key) ?? 0;
}

/** Drops every saved offset. Call this when the underlying query changes so a new table starts at the left edge. */
function resetSyncedHorizontalOffsets() {
    offsetsByKey.clear();
}

function publishOffset(key: string, offsetX: number, source: Listener) {
    offsetsByKey.set(key, offsetX);
    for (const listener of listenersByKey.get(key) ?? []) {
        if (listener !== source) {
            listener(offsetX);
        }
    }
}

function subscribeToOffset(key: string, listener: Listener) {
    let listeners = listenersByKey.get(key);
    if (!listeners) {
        listeners = new Set();
        listenersByKey.set(key, listeners);
    }
    listeners.add(listener);
    return () => {
        listeners?.delete(listener);
        if (listeners?.size === 0) {
            listenersByKey.delete(key);
        }
    };
}

/**
 * Keeps several horizontal table scrollers that share a `key` on the same offset.
 *
 * A group's sticky column sub-header and its transaction rows are two separate FlashList rows, so they cannot
 * share one scroll container. Syncing their offsets is what keeps the header columns lined up with the rows
 * once the table is wider than the viewport.
 *
 * Returns the ref to attach to the scroller, the `onScroll` handler that broadcasts its offset, and the offset
 * to seed `contentOffset` with so a freshly mounted (or FlashList-recycled) scroller never paints at zero.
 */
function useSyncedHorizontalScroll(key: string | undefined, isEnabled: boolean) {
    const scrollViewRef = useRef<RNScrollView>(null);

    // The offset we last wrote to this scroller, so the scroll event it echoes back isn't re-broadcast.
    const appliedOffsetRef = useRef<number | undefined>(undefined);

    const scrollToOffset = useCallback((offsetX: number) => {
        appliedOffsetRef.current = offsetX;
        scrollViewRef.current?.scrollTo({x: offsetX, animated: false});
    }, []);

    useEffect(() => {
        if (!key || !isEnabled) {
            return;
        }
        return subscribeToOffset(key, scrollToOffset);
    }, [key, isEnabled, scrollToOffset]);

    // Restore synchronously before paint to avoid a visible horizontal jump on the table.
    useLayoutEffect(() => {
        if (!key || !isEnabled) {
            return;
        }
        const offsetX = getSyncedHorizontalOffset(key);
        if (offsetX <= 0) {
            return;
        }
        scrollToOffset(offsetX);
    }, [key, isEnabled, scrollToOffset]);

    const onScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (!key) {
                return;
            }
            const offsetX = event.nativeEvent.contentOffset.x;
            const appliedOffset = appliedOffsetRef.current;
            appliedOffsetRef.current = undefined;

            // This event is the echo of a programmatic scroll we just made, so the offset is already published.
            if (appliedOffset !== undefined && Math.abs(appliedOffset - offsetX) < 1) {
                return;
            }
            publishOffset(key, offsetX, scrollToOffset);
        },
        [key, scrollToOffset],
    );

    return {scrollViewRef, onScroll, initialOffset: key ? getSyncedHorizontalOffset(key) : 0};
}

export default useSyncedHorizontalScroll;
export {getSyncedHorizontalOffset, resetSyncedHorizontalOffsets};
