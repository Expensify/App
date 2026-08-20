// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';

import {useLayoutEffect, useRef} from 'react';

import type {SyncedHorizontalScroll} from './types';

import {getSyncedHorizontalOffset, publishSyncedHorizontalOffset, resetSyncedHorizontalOffsets, subscribeToSyncedHorizontalOffset} from './store';

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
 * Reading and writing `scrollLeft` inside the DOM event puts both scrollers in the same frame instead.
 *
 * See ./types for what this hook is for, and ./index.native.ts for the React-level equivalent.
 */
const useSyncedHorizontalScroll = (key: string | undefined, isEnabled: boolean): SyncedHorizontalScroll => {
    const scrollViewRef = useRef<RNScrollView>(null);

    // A layout effect so the offset is restored before paint: a scroller FlashList just recycled must not flash at zero.
    useLayoutEffect(() => {
        if (!key || !isEnabled) {
            return;
        }
        const node = getScrollableElement(scrollViewRef.current);
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
            // Either this scroller is already where the group agreed to be, or it is the echo of the write above.
            if (getSyncedHorizontalOffset(key) === node.scrollLeft) {
                return;
            }
            publishSyncedHorizontalOffset(key, node.scrollLeft, applyOffset);
        };

        node.addEventListener('scroll', handleScroll, {passive: true});
        const unsubscribe = subscribeToSyncedHorizontalOffset(key, applyOffset);
        applyOffset(getSyncedHorizontalOffset(key));

        return () => {
            node.removeEventListener('scroll', handleScroll);
            unsubscribe();
        };
    }, [key, isEnabled]);

    return {scrollViewRef, initialOffset: key ? getSyncedHorizontalOffset(key) : 0};
};

export default useSyncedHorizontalScroll;
export {resetSyncedHorizontalOffsets};
