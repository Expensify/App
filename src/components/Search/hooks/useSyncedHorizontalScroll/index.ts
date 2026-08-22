// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';

import {useCallback, useRef} from 'react';

import type {SyncedHorizontalScroll, UseSyncedHorizontalScroll} from './types';

import {getSyncedHorizontalOffset, publishSyncedHorizontalOffset, subscribeToSyncedHorizontalOffset} from './store';

/** Stable identity, so spreading it never gives the ScrollView a new props object to diff. */
const NO_SYNC_PROPS: SyncedHorizontalScroll['syncProps'] = {};

/** React Native types `getScrollableNode` as `any`; on web it resolves to the element that actually scrolls. */
function getScrollableElement(scrollView: RNScrollView | null): HTMLElement | undefined {
    const node: unknown = scrollView?.getScrollableNode();
    return node instanceof HTMLElement ? node : undefined;
}

/**
 * Web: the sync runs on the DOM scroll event rather than through the ScrollView's `onScroll` prop.
 *
 * `onScroll` is throttled to CONST.TIMING.MIN_SMOOTH_SCROLL_EVENT_THROTTLE and then has to travel through a React
 * callback before it can move the other scroller, which reads as the header trailing the rows by a frame or two.
 * Reading and writing `scrollLeft` inside the DOM event puts the header and the rows in the same frame instead, and costs no
 * render: nothing here touches React state, so a scroll never re-renders a row.
 *
 * Because of that, this platform needs no props on the ScrollView at all — only the ref.
 *
 * See ./types for what this hook is for, and ./index.native.ts for the React-level equivalent.
 */
const useSyncedHorizontalScroll: UseSyncedHorizontalScroll = (key, isEnabled) => {
    const releaseRef = useRef<(() => void) | undefined>(undefined);

    // Binding in the ref callback rather than an effect is what makes this track the scroller itself: a group renders
    // collapsed, so its sub-header scroller mounts on expand, well after this hook's first render — and since the
    // group header stays mounted across expand/collapse, an effect keyed on render values never re-runs to catch it.
    // React invokes this on mount, on unmount (with null), and whenever `key`/`isEnabled` change its identity.
    const scrollViewRef = useCallback(
        (scrollView: RNScrollView | null) => {
            releaseRef.current?.();
            releaseRef.current = undefined;

            if (!key || !isEnabled) {
                return;
            }
            const node = getScrollableElement(scrollView);
            if (!node) {
                return;
            }

            const applyOffset = (offsetX: number) => {
                if (node.scrollLeft === offsetX) {
                    return;
                }
                node.scrollLeft = offsetX;
            };

            const handleScroll = () => {
                // Either this scroller is already where the group agreed to be, or this is the echo of the write above.
                if (getSyncedHorizontalOffset(key) === node.scrollLeft) {
                    return;
                }
                publishSyncedHorizontalOffset(key, node.scrollLeft, applyOffset);
            };

            node.addEventListener('scroll', handleScroll, {passive: true});
            const unsubscribe = subscribeToSyncedHorizontalOffset(key, applyOffset);

            // Runs during commit, so a scroller that just mounted (or that FlashList recycled) is already at the
            // group's offset before the browser paints it.
            applyOffset(getSyncedHorizontalOffset(key));

            releaseRef.current = () => {
                node.removeEventListener('scroll', handleScroll);
                unsubscribe();
            };
        },
        [key, isEnabled],
    );

    return {scrollViewRef, syncProps: NO_SYNC_PROPS};
};

export default useSyncedHorizontalScroll;
