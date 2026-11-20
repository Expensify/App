/**
 * Publishes what the Spend table's left-pinned cells and cover need from its scroller: the scroll timeline that moves them, the
 * furthest the table scrolls, and how wide the pinned region is. Without scroll-driven animations it also writes the scroll offset
 * from the scroll handler, so it lands a frame late.
 */
import {canUseScrollTimeline} from '@components/Search/pinnedCellStyles';
import {
    PINNED_HEADER_ROW_SELECTOR,
    PINNED_HEADING_SELECTOR,
    PINNED_SCROLL_TIMELINE,
    PINNED_SCROLL_X_MAX_VARIABLE,
    PINNED_SCROLL_X_VARIABLE,
    PINNED_START_COVER_OPACITY_VARIABLE,
    PINNED_START_EDGE_SELECTOR,
    PINNED_START_WIDTH_VARIABLE,
} from '@components/Search/pinnedCellStyles/pinnedScrollVariables';
import type {SearchColumnType} from '@components/Search/types';

import variables from '@styles/variables';

import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports -- only the type of the ref HorizontalTableScroll passes in, not the restricted component
import type {ScrollView as RNScrollView, View} from 'react-native';

import {useLayoutEffect} from 'react';

function getHTMLElement(node: unknown): HTMLElement | undefined {
    return node instanceof HTMLElement ? node : undefined;
}

/** Layout offsets ignore transforms, so the pinned headings measure where they sit in the row whatever their translation. */
function getOffsetLeftWithin(element: HTMLElement, ancestor: HTMLElement) {
    let offset = 0;
    let current: HTMLElement | null = element;
    while (current && current !== ancestor) {
        offset += current.offsetLeft;
        const parent: Element | null = current.offsetParent;
        current = parent instanceof HTMLElement ? parent : null;
    }
    return offset;
}

/** Every row shares the header row's edges and column widths, so the region is measured once, on its headings. */
function writeLayoutVariables(container: HTMLElement, scroller: HTMLElement) {
    container.style.setProperty(PINNED_SCROLL_X_MAX_VARIABLE, `${Math.max(scroller.scrollWidth - scroller.clientWidth, 0)}px`);

    const headerRow = container.querySelector(PINNED_HEADER_ROW_SELECTOR);
    const startEdge = headerRow?.querySelector(PINNED_START_EDGE_SELECTOR);
    if (!(headerRow instanceof HTMLElement) || !(startEdge instanceof HTMLElement)) {
        return;
    }
    container.style.setProperty(PINNED_START_WIDTH_VARIABLE, `${getOffsetLeftWithin(startEdge, headerRow) + startEdge.offsetWidth + variables.searchTableColumnGap}px`);
}

function writeScrollVariables(container: HTMLElement, scroller: HTMLElement) {
    const scrollX = scroller.scrollLeft;
    container.style.setProperty(PINNED_SCROLL_X_VARIABLE, `${scrollX}px`);
    container.style.setProperty(PINNED_START_COVER_OPACITY_VARIABLE, String(Number(scrollX > 0)));
}

/**
 * @param leftPinned A stable reference that changes whenever the pinned columns do, since pinning moves the headings without resizing anything.
 * @returns Call it from the scroller's scroll handler.
 */
function usePinnedScrollVariables(containerRef: RefObject<View | null>, scrollViewRef: RefObject<RNScrollView | null>, isScrolling: boolean, leftPinned: SearchColumnType[]): () => void {
    const hasPinnedColumns = leftPinned.length > 0;

    useLayoutEffect(() => {
        const container = isScrolling && hasPinnedColumns ? getHTMLElement(containerRef.current) : undefined;
        const scroller = container ? getHTMLElement(scrollViewRef.current?.getScrollableNode()) : undefined;
        if (!container || !scroller) {
            return;
        }

        if (canUseScrollTimeline) {
            scroller.style.setProperty('scroll-timeline', `${PINNED_SCROLL_TIMELINE} inline`);
            // Lets the mask beside the scroller follow its timeline too.
            container.style.setProperty('timeline-scope', PINNED_SCROLL_TIMELINE);
        } else {
            writeScrollVariables(container, scroller);
        }
        writeLayoutVariables(container, scroller);

        // Resizing a column changes how far the table scrolls and where the headings sit, and can clamp the scroll offset, without a
        // scroll event. A drag holds the scroll extent still, so a pinned heading changing size is the only sign one of them was resized.
        const resizeObserver = new ResizeObserver(() => {
            writeLayoutVariables(container, scroller);
            if (!canUseScrollTimeline) {
                writeScrollVariables(container, scroller);
            }
        });
        const headerRow = container.querySelector(PINNED_HEADER_ROW_SELECTOR);
        for (const element of [scroller, scroller.firstElementChild, headerRow, ...(headerRow?.querySelectorAll(PINNED_HEADING_SELECTOR) ?? [])]) {
            if (element) {
                resizeObserver.observe(element);
            }
        }

        return () => resizeObserver.disconnect();
    }, [containerRef, scrollViewRef, isScrolling, hasPinnedColumns, leftPinned]);

    return () => {
        if (canUseScrollTimeline) {
            return;
        }
        const container = getHTMLElement(containerRef.current);
        const scroller = getHTMLElement(scrollViewRef.current?.getScrollableNode());
        if (container && scroller) {
            writeScrollVariables(container, scroller);
        }
    };
}

export default usePinnedScrollVariables;
