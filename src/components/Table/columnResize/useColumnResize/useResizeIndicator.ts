/** The line marking a dragged column edge and the grip marking a hovered heading's edge, toggled through custom properties so neither re-renders the table. */
import {
    RESIZE_GRIP_HOVER_VARIABLE,
    RESIZE_INDICATOR_DATA_ATTRIBUTE,
    RESIZE_INDICATOR_HEIGHT_VARIABLE,
    RESIZE_INDICATOR_OPACITY_VARIABLE,
    RESIZE_INDICATOR_TOP_VARIABLE,
    TABLE_ROW_SELECTOR,
} from '@components/Table/columnResize/columnWidthExpressions';

import CONST from '@src/CONST';

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

    // Starts clipped to the handle's box, which the grip fills, so the grip reads as stretching into the line.
    const gripTop = handleRect.top - headerRowTop;
    const gripBottom = lowestRowBottom - handleRect.bottom;
    handleElement.querySelector<HTMLElement>(`[${RESIZE_INDICATOR_DATA_ATTRIBUTE}]`)?.animate([{clipPath: `inset(${gripTop}px 0 ${gripBottom}px 0)`}, {clipPath: 'inset(0 0 0 0)'}], {
        duration: CONST.TABLES.COLUMN_RESIZE.INDICATOR_MORPH_DURATION,
        easing: 'ease-out',
    });
}

function setGripHovered(handleElement: HTMLElement, isHovered: boolean) {
    handleElement.style.setProperty(RESIZE_GRIP_HOVER_VARIABLE, isHovered ? INDICATOR_OPACITY.VISIBLE : INDICATOR_OPACITY.HIDDEN);
}

/** Ref callback for a handle: shows its grip while the pointer is over its heading cell, the handle's parent. */
function trackHeadingHover(handleElement: HTMLElement | null): (() => void) | undefined {
    const headingElement = handleElement?.parentElement;

    if (!handleElement || !headingElement) {
        return;
    }

    const showGrip = () => setGripHovered(handleElement, true);
    const hideGrip = () => setGripHovered(handleElement, false);

    headingElement.addEventListener('pointerenter', showGrip);
    headingElement.addEventListener('pointerleave', hideGrip);

    return () => {
        headingElement.removeEventListener('pointerenter', showGrip);
        headingElement.removeEventListener('pointerleave', hideGrip);
    };
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
export {setGripHovered, trackHeadingHover};
