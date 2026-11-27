/** Publishes the CSS variables the sticky header and pinned cells need. A scroll only flips the divider and the mask. */
import {
    getPinnedLeftVariable,
    PINNED_GUTTER_MASK_VISIBILITY_VARIABLE,
    PINNED_HEADER_ROW_SELECTOR,
    PINNED_HEADING_SELECTOR,
    PINNED_LEFT_EDGE_VARIABLE,
    PINNED_LEFT_LEAD_VARIABLE,
    PINNED_SCROLLBAR_HEIGHT_VARIABLE,
    PINNED_START_EDGE_OPACITY_VARIABLE,
    PINNED_START_WIDTH_VARIABLE,
    STICKY_HEADER_HEIGHT_VARIABLE,
} from '@components/Search/pinnedCellStyles/pinnedScrollVariables';
import getTableScroller from '@components/Search/primitives/getTableScroller';
import type {SearchColumnType} from '@components/Search/types';

import type {RefObject} from 'react';
import type {View} from 'react-native';

import {useLayoutEffect} from 'react';

function getHTMLElement(node: unknown): HTMLElement | undefined {
    return node instanceof HTMLElement ? node : undefined;
}

function getContentLeft(element: HTMLElement, origin: number) {
    return element.getBoundingClientRect().left - origin + element.clientLeft + (parseFloat(getComputedStyle(element).paddingLeft) || 0);
}

/** Measures where the pinned boxes rest. Only boxes that never stick are measured, since a sticky box reports where it's stuck. */
function writePinnedLayoutVariables(container: HTMLElement, scroller: HTMLElement, headerRow: HTMLElement, pinCount: number) {
    const headingRow = getHTMLElement(headerRow.querySelector(PINNED_HEADING_SELECTOR)?.parentElement);
    if (!headingRow) {
        // Nothing to measure from, so no stale region is left for the covers.
        for (const variable of [PINNED_LEFT_EDGE_VARIABLE, PINNED_START_WIDTH_VARIABLE]) {
            container.style.removeProperty(variable);
        }
        return;
    }

    const origin = scroller.getBoundingClientRect().left + scroller.clientLeft - scroller.scrollLeft;
    const edge = headerRow.getBoundingClientRect().left - origin;
    const gap = parseFloat(getComputedStyle(headingRow).columnGap) || 0;

    let left = getContentLeft(headingRow, origin);
    let pinIndex = 0;
    for (const heading of headingRow.children) {
        if (pinIndex === pinCount) {
            break;
        }
        if (heading instanceof HTMLElement && heading.matches(PINNED_HEADING_SELECTOR)) {
            container.style.setProperty(getPinnedLeftVariable(pinIndex), `${left}px`);
            pinIndex++;
        }
        // The rect's width, not offsetWidth, which rounds and would make fractional widths drift across pins.
        left += heading.getBoundingClientRect().width + gap;
    }

    container.style.setProperty(PINNED_LEFT_EDGE_VARIABLE, `${edge}px`);
    container.style.setProperty(PINNED_LEFT_LEAD_VARIABLE, `${getContentLeft(headerRow, origin)}px`);
    container.style.setProperty(PINNED_START_WIDTH_VARIABLE, `${left - edge}px`);
}

/** @param leftPinned Changes whenever the pinned columns do, since pinning moves headings without resizing anything. */
function usePinnedScrollVariables(containerRef: RefObject<View | null>, isListScrollingBothAxes: boolean, leftPinned: SearchColumnType[]) {
    const pinCount = leftPinned.length;

    useLayoutEffect(() => {
        const table = getTableScroller(containerRef, isListScrollingBothAxes);
        if (!table) {
            return;
        }
        const {container, scroller} = table;

        let isScrolledAway: boolean | undefined;

        const writeScrollState = () => {
            if (!pinCount) {
                return;
            }
            // Columns pass beneath the pins and rows slide into the page margin as soon as the table leaves its start.
            const isScrolled = scroller.scrollLeft > 0;
            if (isScrolled === isScrolledAway) {
                return;
            }
            isScrolledAway = isScrolled;
            container.style.setProperty(PINNED_START_EDGE_OPACITY_VARIABLE, String(Number(isScrolled)));
            container.style.setProperty(PINNED_GUTTER_MASK_VISIBILITY_VARIABLE, isScrolled ? 'visible' : 'hidden');
        };
        const writeLayout = () => {
            const headerRow = getHTMLElement(container.querySelector(PINNED_HEADER_ROW_SELECTOR));
            if (!headerRow) {
                return;
            }
            // Focus scrolling clears the sticky header with or without pins.
            container.style.setProperty(STICKY_HEADER_HEIGHT_VARIABLE, `${headerRow.getBoundingClientRect().height}px`);
            container.style.setProperty(PINNED_SCROLLBAR_HEIGHT_VARIABLE, `${scroller.offsetHeight - scroller.clientHeight}px`);
            if (pinCount) {
                writePinnedLayoutVariables(container, scroller, headerRow, pinCount);
            }
        };

        writeLayout();
        writeScrollState();
        scroller.addEventListener('scroll', writeScrollState, {passive: true});

        // Resizing a column or the window moves the pinned boxes without a scroll event.
        const resizeObserver = new ResizeObserver(() => {
            writeLayout();
            writeScrollState();
        });
        const headerRow = container.querySelector(PINNED_HEADER_ROW_SELECTOR);
        for (const element of [scroller, headerRow, ...(headerRow?.querySelectorAll(PINNED_HEADING_SELECTOR) ?? [])]) {
            if (element) {
                resizeObserver.observe(element);
            }
        }

        return () => {
            resizeObserver.disconnect();
            scroller.removeEventListener('scroll', writeScrollState);
        };
    }, [containerRef, isListScrollingBothAxes, pinCount, leftPinned]);
}

export default usePinnedScrollVariables;
