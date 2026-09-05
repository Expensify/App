import CONST from '@src/CONST';

// eslint-disable-next-line no-restricted-imports
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';

import {useCallback, useMemo, useRef} from 'react';

import type {SyncedHorizontalScroll, UseSyncedHorizontalScroll} from './types';

import {getSyncedHorizontalOffset, publishSyncedHorizontalOffset, subscribeToSyncedHorizontalOffset} from './store';

/** Stable identity, so spreading it never gives the ScrollView a new props object to diff. */
const NO_SYNC_PROPS: SyncedHorizontalScroll['syncProps'] = {};

/**
 * Native: the sync runs through the ScrollView's `onScroll` prop, the only scroll signal available here.
 *
 * Splitting a group into a sticky header row plus a children row is web-only today, so on native the callers pass no
 * key and this hook returns empty `syncProps` — it must not hand the rows' ScrollView an `onScroll`, or every native
 * table wider than the screen (tablets clear the large-screen breakpoint) would start firing throttled scroll events
 * into a handler that does nothing. It is a working implementation rather than a stub so that enabling the split on
 * native degrades to a throttled sync instead of silently doing nothing.
 *
 * See ./types for what this hook is for, and ./index.ts for the DOM-level web version.
 */
const useSyncedHorizontalScroll: UseSyncedHorizontalScroll = (key, isEnabled) => {
    const scrollViewInstanceRef = useRef<RNScrollView | null>(null);
    const releaseRef = useRef<(() => void) | undefined>(undefined);

    // The offset we last wrote to this scroller, so the scroll event it echoes back isn't re-broadcast.
    const appliedOffsetRef = useRef<number | undefined>(undefined);

    const applyOffset = useCallback((offsetX: number) => {
        appliedOffsetRef.current = offsetX;
        scrollViewInstanceRef.current?.scrollTo({x: offsetX, animated: false});
    }, []);

    // Subscribing in the ref callback rather than an effect keeps this tied to the scroller's own mount: a group
    // renders collapsed, so its scroller appears on expand, long after this hook's first render.
    const scrollViewRef = useCallback(
        (scrollView: RNScrollView | null) => {
            scrollViewInstanceRef.current = scrollView;
            releaseRef.current?.();
            releaseRef.current = undefined;

            if (!scrollView || !key || !isEnabled) {
                return;
            }
            releaseRef.current = subscribeToSyncedHorizontalOffset(key, applyOffset);

            // Runs during commit, so a scroller that just mounted is already at the group's offset before it paints.
            const offsetX = getSyncedHorizontalOffset(key);
            if (offsetX > 0) {
                applyOffset(offsetX);
            }
        },
        [key, isEnabled, applyOffset],
    );

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

    const syncProps = useMemo(() => (key && isEnabled ? {onScroll, scrollEventThrottle: CONST.TIMING.MIN_SMOOTH_SCROLL_EVENT_THROTTLE} : NO_SYNC_PROPS), [key, isEnabled, onScroll]);

    return {scrollViewRef, syncProps};
};

export default useSyncedHorizontalScroll;
