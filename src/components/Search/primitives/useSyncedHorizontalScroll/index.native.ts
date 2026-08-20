// eslint-disable-next-line no-restricted-imports
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';

import {useCallback, useEffect, useLayoutEffect, useRef} from 'react';

import type {SyncedHorizontalScroll} from './types';

import {getSyncedHorizontalOffset, publishSyncedHorizontalOffset, resetSyncedHorizontalOffsets, subscribeToSyncedHorizontalOffset} from './store';

/**
 * Native: the sync runs through the ScrollView's `onScroll` prop, the only scroll signal available here.
 *
 * Splitting a group into a sticky header row plus a children row is web-only today, so on native the callers pass no
 * key and this hook stays inert. It is a working implementation rather than a stub so enabling the split on native
 * degrades to a throttled sync instead of silently doing nothing.
 *
 * See ./types for what this hook is for, and ./index.ts for the DOM-level web version.
 */
const useSyncedHorizontalScroll = (key: string | undefined, isEnabled: boolean): SyncedHorizontalScroll => {
    const scrollViewRef = useRef<RNScrollView>(null);

    // The offset we last wrote to this scroller, so the scroll event it echoes back isn't re-broadcast.
    const appliedOffsetRef = useRef<number | undefined>(undefined);

    const applyOffset = useCallback((offsetX: number) => {
        appliedOffsetRef.current = offsetX;
        scrollViewRef.current?.scrollTo({x: offsetX, animated: false});
    }, []);

    useEffect(() => {
        if (!key || !isEnabled) {
            return;
        }
        return subscribeToSyncedHorizontalOffset(key, applyOffset);
    }, [key, isEnabled, applyOffset]);

    // Restore before paint, so a scroller FlashList just recycled doesn't flash at the left edge.
    useLayoutEffect(() => {
        if (!key || !isEnabled) {
            return;
        }
        const offsetX = getSyncedHorizontalOffset(key);
        if (offsetX <= 0) {
            return;
        }
        applyOffset(offsetX);
    }, [key, isEnabled, applyOffset]);

    const onScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (!key) {
                return;
            }
            const offsetX = event.nativeEvent.contentOffset.x;
            const appliedOffset = appliedOffsetRef.current;
            appliedOffsetRef.current = undefined;

            // This event is the echo of a write we just made, so the offset it reports is already published.
            if (appliedOffset !== undefined && Math.abs(appliedOffset - offsetX) < 1) {
                return;
            }
            publishSyncedHorizontalOffset(key, offsetX, applyOffset);
        },
        [key, applyOffset],
    );

    return {scrollViewRef, onScroll, initialOffset: key ? getSyncedHorizontalOffset(key) : 0};
};

export default useSyncedHorizontalScroll;
export {resetSyncedHorizontalOffsets};
