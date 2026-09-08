// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, View as RNView} from 'react-native';

import {useRef} from 'react';

import type {SyncedHorizontalScroll, UseHorizontalScrollFollower, UseSyncedHorizontalScroll} from './types';

import {getSyncedHorizontalOffset, publishSyncedHorizontalOffset, subscribeToSyncedHorizontalOffset} from './store';

/** Stable identity, so spreading it never gives the ScrollView a new props object to diff. */
const NO_SYNC_PROPS: SyncedHorizontalScroll['syncProps'] = {};

/** React Native types its host node handles loosely, so narrow to the element before touching any DOM API. */
function asElement(node: unknown): HTMLElement | undefined {
    return node instanceof HTMLElement ? node : undefined;
}

/** React Native types `getScrollableNode` as `any`. On web it resolves to the element that actually scrolls. */
function getScrollableElement(scrollView: RNScrollView | null): HTMLElement | undefined {
    return asElement(scrollView?.getScrollableNode());
}

/**
 * Web: the offset is published from the DOM scroll event rather than through the ScrollView's `onScroll` prop.
 *
 * `onScroll` is throttled to CONST.TIMING.MIN_SMOOTH_SCROLL_EVENT_THROTTLE and then has to travel through a React
 * callback before it can move the sub-header, which reads as the header trailing the rows by a frame or two. Reading
 * `scrollLeft` inside the DOM event puts the header and the rows in the same frame instead, and costs no render:
 * nothing here touches React state, so a scroll never re-renders a row.
 *
 * Because of that, this platform needs no props on the ScrollView at all, only the ref.
 *
 * See ./types for what this hook is for, and ./index.native.ts for the React-level equivalent.
 */
const useSyncedHorizontalScroll: UseSyncedHorizontalScroll = (key, isEnabled) => {
    const releaseRef = useRef<(() => void) | undefined>(undefined);

    // Binding in the ref callback rather than an effect is what makes this track the scroller itself. A group renders
    // collapsed, so its rows scroller mounts on expand, well after this hook's first render, and the group header
    // stays mounted across expand and collapse, so an effect keyed on render values never re-runs to catch it.
    // React invokes this on mount, on unmount (with null), and whenever `key`/`isEnabled` change its identity, which
    // React Compiler is what keeps stable across renders here.
    const scrollViewRef = (scrollView: RNScrollView | null) => {
        releaseRef.current?.();
        releaseRef.current = undefined;

        if (!key || !isEnabled) {
            return;
        }
        const node = getScrollableElement(scrollView);
        if (!node) {
            return;
        }

        const publishOffset = () => publishSyncedHorizontalOffset(key, node.scrollLeft);

        node.addEventListener('scroll', publishOffset, {passive: true});

        // Runs during commit, so a scroller that just mounted (or that FlashList recycled) is already at the group's
        // offset before the browser paints it. The write fires `publishOffset`, which republishes the offset the
        // followers are already on. That is harmless, and it re-aligns a follower that mounted first.
        const offsetX = getSyncedHorizontalOffset(key);
        if (offsetX > 0) {
            node.scrollLeft = offsetX;
        }

        releaseRef.current = () => node.removeEventListener('scroll', publishOffset);
    };

    return {scrollViewRef, syncProps: NO_SYNC_PROPS};
};

/**
 * Web: the follower is moved by writing `scrollLeft` straight onto the DOM node.
 *
 * The node is an `overflow: hidden` clip around content wider than itself, which still makes it a scroll container.
 * `scrollLeft` moves it, but it renders no scrollbar and the user cannot drag it. That is the whole point, because it
 * mirrors the rows without being a second thing that can be scrolled, so it never publishes an offset of its own.
 *
 * `scrollLeft` rather than a `transform` deliberately, even though a transform is the cheaper property in isolation. A
 * transform is a style mutation, so it is committed at the next rendering opportunity, while a scroll-offset write
 * rides the scrolling machinery the browser is already updating for the driver in that same frame. Mirroring by
 * transform measured visibly further behind the rows.
 *
 * The write bypasses React for the same reason the publisher does: a horizontal scroll must not re-render a table row.
 *
 * See ./types for what this hook is for, and ./index.native.ts for why native has nothing to do here.
 */
const useHorizontalScrollFollower: UseHorizontalScrollFollower = (key, isEnabled) => {
    const releaseRef = useRef<(() => void) | undefined>(undefined);

    // A ref callback for the same reason the publisher uses one, plus one of its own. When a group header sticks,
    // FlashList mounts a second copy of it, and that copy has to pick the group's offset up as it arrives.
    return (view: RNView | null) => {
        releaseRef.current?.();
        releaseRef.current = undefined;

        if (!key || !isEnabled) {
            return;
        }
        const node = asElement(view);
        if (!node) {
            return;
        }

        // A clip that is only ever scrolled programmatically does not get the composited scrolling the browser hands
        // a scroller the user can drag, which leaves every offset repainting the whole sub-header. `scroll-position`
        // is the hint for an element whose scroll offset is about to change, and unlike `will-change: transform` or
        // `contain: paint` it creates no containing block and no stacking context, so nothing positioned inside the
        // column header starts resolving against this element instead.
        node.style.willChange = 'scroll-position';

        const applyOffset = (offsetX: number) => {
            if (node.scrollLeft === offsetX) {
                return;
            }
            node.scrollLeft = offsetX;
        };

        // Runs during commit, so the copy FlashList mounts when a header sticks is already at the group's offset
        // before the browser paints it, instead of flashing at the start of the table for a frame.
        applyOffset(getSyncedHorizontalOffset(key));

        const unsubscribe = subscribeToSyncedHorizontalOffset(key, applyOffset);

        releaseRef.current = () => {
            // FlashList recycles this node, so drop the hint rather than leaving it on a header that has stopped
            // following anything. `will-change` costs the browser resources for as long as it is set.
            node.style.willChange = '';
            unsubscribe();
        };
    };
};

export {useHorizontalScrollFollower, useSyncedHorizontalScroll};
