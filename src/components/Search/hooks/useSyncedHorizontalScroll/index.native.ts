import CONST from '@src/CONST';

import type {Ref} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView, View as RNView} from 'react-native';

import {useCallback, useMemo} from 'react';

import type {SyncedHorizontalScroll, UseHorizontalScrollFollower, UseSyncedHorizontalScroll} from './types';

import {getSyncedHorizontalOffset, publishSyncedHorizontalOffset} from './store';

/** Stable identity, so spreading it never gives the ScrollView a new props object to diff. */
const NO_SYNC_PROPS: SyncedHorizontalScroll['syncProps'] = {};

/**
 * Native: the offset is published through the ScrollView's `onScroll` prop, the only scroll signal available here.
 *
 * Splitting a group into a sticky header row plus a children row is web-only today, so on native the callers pass no
 * key and this hook returns empty `syncProps`. It must not hand the rows' ScrollView an `onScroll`, or every native
 * table wider than the screen (tablets clear the large-screen breakpoint) would start firing throttled scroll events
 * into a handler that does nothing. It is a working implementation rather than a stub so that enabling the split on
 * native degrades to a throttled publish instead of silently doing nothing.
 *
 * See ./types for what this hook is for, and ./index.ts for the DOM-level web version.
 */
const useSyncedHorizontalScroll: UseSyncedHorizontalScroll = (key, isEnabled) => {
    // The memoization here is manual on purpose. Once it is removed this file has no hook calls left at all, so React
    // Compiler stops treating this as a hook (it reports `no-components`) and memoizes nothing, which would hand
    // `scrollViewRef` a new identity on every render. React would then detach and re-attach the ref each time and
    // re-run the offset restore below. The web variant keeps a `useRef`, so the compiler does memoize it and it needs
    // none of this.

    // Restoring in the ref callback rather than an effect keeps this tied to the scroller's own mount: a group renders
    // collapsed, so its scroller appears on expand, long after this hook's first render.
    const scrollViewRef = useCallback(
        (scrollView: RNScrollView | null) => {
            if (!scrollView || !key || !isEnabled) {
                return;
            }

            // Runs during commit, so a scroller that just mounted is already at the group's offset before it paints.
            const offsetX = getSyncedHorizontalOffset(key);
            if (offsetX > 0) {
                scrollView.scrollTo({x: offsetX, animated: false});
            }
        },
        [key, isEnabled],
    );

    const publishOffset = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (!key) {
                return;
            }
            publishSyncedHorizontalOffset(key, event.nativeEvent.contentOffset.x);
        },
        [key],
    );

    const syncProps = useMemo(
        () => (key && isEnabled ? {onScroll: publishOffset, scrollEventThrottle: CONST.TIMING.MIN_SMOOTH_SCROLL_EVENT_THROTTLE} : NO_SYNC_PROPS),
        [key, isEnabled, publishOffset],
    );

    return {scrollViewRef, syncProps};
};

/**
 * Native: nothing to follow, so this attaches nothing.
 *
 * The follower exists only for the split-group layout, which is web-only. Everywhere else a group renders its column
 * labels inside the same scroller as its rows, so they stay aligned with no syncing at all. Enabling the split on
 * native would need a real implementation here, a Reanimated shared value driving the labels' `translateX`, since
 * there is no DOM node to write a scroll offset onto. Carrying that while it is unused was not worth the surface area.
 */
const NO_FOLLOWER: Ref<RNView> = () => {};

const useHorizontalScrollFollower: UseHorizontalScrollFollower = () => NO_FOLLOWER;

export {useHorizontalScrollFollower, useSyncedHorizontalScroll};
