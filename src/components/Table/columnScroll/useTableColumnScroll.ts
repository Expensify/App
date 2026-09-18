import type {TableData} from '@components/Table/types';

import type {FlashListRef} from '@shopify/flash-list';

import {useEffect, useRef} from 'react';

import type {UseTableColumnScroll} from './types';

/** React Native types its host node handles loosely, so narrow to the element before touching any DOM API. */
function asElement(node: unknown): HTMLElement | undefined {
    return node instanceof HTMLElement ? node : undefined;
}

/** `getScrollableNode` is typed as `any` by FlashList. On web it resolves to the element that actually scrolls. */
function getScrollableElement(list: FlashListRef<TableData> | null): HTMLElement | undefined {
    return asElement(list?.getScrollableNode?.());
}

/**
 * Web implementation of the hook described in ./types.
 *
 * The offset is read straight from the DOM rather than through FlashList's `onScroll` prop, which is throttled and
 * then has to travel through a React callback — the header trails the rows by a frame or two. Reading `scrollLeft`
 * inside the DOM event puts the header and the rows in the same frame.
 *
 * The header is moved by writing `scrollLeft` on its clip rather than by transforming it: a scroll-offset write rides
 * the scrolling machinery the browser is already updating in that same frame, while a transform is a style mutation
 * committed at the next rendering opportunity.
 */
const useTableColumnScroll: UseTableColumnScroll = (listRef, isEnabled) => {
    // The node to mirror, and the offset to mirror it at, both live outside React: a horizontal scroll must not
    // re-render a table row.
    const followerRef = useRef<HTMLElement | undefined>(undefined);
    const offsetRef = useRef(0);

    const applyOffset = () => {
        const node = followerRef.current;
        if (!node || node.scrollLeft === offsetRef.current) {
            return;
        }
        node.scrollLeft = offsetRef.current;
    };

    useEffect(() => {
        if (!isEnabled) {
            return;
        }

        const scroller = getScrollableElement(listRef.current);
        if (!scroller) {
            return;
        }

        const readOffset = () => {
            offsetRef.current = scroller.scrollLeft;
            applyOffset();
        };

        scroller.addEventListener('scroll', readOffset, {passive: true});

        // The scroller keeps its offset across a re-enable (a column toggled back on), so read it once here rather
        // than waiting for the next scroll to discover where the table already is.
        readOffset();

        return () => scroller.removeEventListener('scroll', readOffset);
    }, [isEnabled, listRef]);

    // A callback ref rather than an effect because FlashList mounts the stuck header's overlay copy on demand and
    // recycles it, so the node to mirror changes without this hook's inputs changing.
    return (view) => {
        const node = asElement(view);
        if (!isEnabled || !node) {
            return;
        }

        // A clip that is only ever scrolled programmatically does not get the composited scrolling the browser hands
        // a scroller the user can drag, which leaves every offset repainting the whole header. Unlike
        // `will-change: transform` this creates no containing block and no stacking context, so nothing positioned
        // inside the column header starts resolving against this element instead.
        node.style.willChange = 'scroll-position';
        followerRef.current = node;

        // Runs during commit, so the copy FlashList mounts when the header sticks is already at the table's offset
        // before the browser paints it, instead of flashing at the first column for a frame.
        applyOffset();

        return () => {
            followerRef.current = undefined;
            // FlashList recycles this node, so drop the hint rather than leaving it on a header that has stopped
            // mirroring anything. `will-change` costs the browser resources for as long as it is set.
            node.style.willChange = '';
        };
    };
};

export default useTableColumnScroll;
