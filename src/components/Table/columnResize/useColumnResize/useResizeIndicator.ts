import {RESIZE_INDICATOR_HEIGHT_VARIABLE, RESIZE_INDICATOR_OPACITY_VARIABLE, RESIZE_INDICATOR_TOP_VARIABLE, TABLE_ROW_SELECTOR} from '@components/Table/columnResize/columnWidthExpressions';

import type {RefObject} from 'react';

import {useRef} from 'react';

const INDICATOR_OPACITY = {
    VISIBLE: '1',
    HIDDEN: '0',
} as const;

type ResizeIndicator = {
    /** Shows the line at the given handle, hiding the one at any other handle. */
    revealIndicator: (handleElement: HTMLElement) => void;

    /** Hides the line, unless a drag is still carrying it. */
    hideIndicator: () => void;
};

/** Shows the handle's line. Measured once per reveal. The line lives in the handle, so drags and scrolls carry it. */
function drawIndicatorAtHandle(scopeElement: HTMLElement | null, handleElement: HTMLElement) {
    const handleRect = handleElement.getBoundingClientRect();
    const headerRowTop = (handleElement.closest(TABLE_ROW_SELECTOR) ?? handleElement).getBoundingClientRect().top;
    let lowestRowBottom = handleRect.bottom;

    for (const row of scopeElement?.querySelectorAll(TABLE_ROW_SELECTOR) ?? []) {
        // Skip the list's hidden twins, but not rows hidden by an outer modal's aria-hidden.
        const hiddenAncestor = row.closest('[aria-hidden="true"]');

        if (hiddenAncestor && scopeElement?.contains(hiddenAncestor)) {
            continue;
        }

        lowestRowBottom = Math.max(lowestRowBottom, row.getBoundingClientRect().bottom);
    }

    handleElement.style.setProperty(RESIZE_INDICATOR_TOP_VARIABLE, `${headerRowTop - handleRect.top}px`);
    handleElement.style.setProperty(RESIZE_INDICATOR_HEIGHT_VARIABLE, `${lowestRowBottom - headerRowTop}px`);
    handleElement.style.setProperty(RESIZE_INDICATOR_OPACITY_VARIABLE, INDICATOR_OPACITY.VISIBLE);
}

/** The column edge line, toggled through custom properties so hovering never re-renders the table. */
function useResizeIndicator(scopeElementRef: RefObject<HTMLElement | null>, dragRef: RefObject<unknown>): ResizeIndicator {
    // The handle whose line is showing, so a drag ending away from it can still hide it.
    const activeHandleElementRef = useRef<HTMLElement | null>(null);

    const revealIndicator = (handleElement: HTMLElement) => {
        if (activeHandleElementRef.current !== handleElement) {
            activeHandleElementRef.current?.style.setProperty(RESIZE_INDICATOR_OPACITY_VARIABLE, INDICATOR_OPACITY.HIDDEN);
        }

        activeHandleElementRef.current = handleElement;
        drawIndicatorAtHandle(scopeElementRef.current, handleElement);
    };

    const hideIndicator = () => {
        // A drag that has left the handle behind still shows where the edge is going.
        if (dragRef.current) {
            return;
        }

        activeHandleElementRef.current?.style.setProperty(RESIZE_INDICATOR_OPACITY_VARIABLE, INDICATOR_OPACITY.HIDDEN);
        activeHandleElementRef.current = null;
    };

    return {revealIndicator, hideIndicator};
}

export default useResizeIndicator;
