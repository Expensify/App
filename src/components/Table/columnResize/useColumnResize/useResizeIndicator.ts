/** The line marking a dragged column edge, toggled through custom properties so a drag never re-renders the table. */
import {RESIZE_INDICATOR_HEIGHT_VARIABLE, RESIZE_INDICATOR_OPACITY_VARIABLE, RESIZE_INDICATOR_TOP_VARIABLE, TABLE_ROW_SELECTOR} from '@components/Table/columnResize/columnWidthExpressions';

import type {RefObject} from 'react';

import {useRef} from 'react';

const INDICATOR_OPACITY = {
    VISIBLE: '1',
    HIDDEN: '0',
} as const;

type ResizeIndicator = {
    revealIndicator: (handleElement: HTMLElement) => void;

    hideIndicator: () => void;
};

/** Measured once per drag. The line lives in the handle, so drags and scrolls carry it. */
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

function useResizeIndicator(scopeElementRef: RefObject<HTMLElement | null>): ResizeIndicator {
    // Lost pointer capture hands over no element, so the dragged handle is remembered to hide its line.
    const activeHandleElementRef = useRef<HTMLElement | null>(null);

    const revealIndicator = (handleElement: HTMLElement) => {
        activeHandleElementRef.current = handleElement;
        drawIndicatorAtHandle(scopeElementRef.current, handleElement);
    };

    const hideIndicator = () => {
        activeHandleElementRef.current?.style.setProperty(RESIZE_INDICATOR_OPACITY_VARIABLE, INDICATOR_OPACITY.HIDDEN);
        activeHandleElementRef.current = null;
    };

    return {revealIndicator, hideIndicator};
}

export default useResizeIndicator;
