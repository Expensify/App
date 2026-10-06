import type {ViewStyle} from 'react-native';

import type {
    GetFrozenCellStyle,
    GetFrozenEdgeOverlayStyle,
    GetFrozenMarginOverlayStyle,
    GetFrozenTranslateStyle,
    MeasureFrozenEdge,
    SetFrozenScrollOffset,
    SyncFrozenScrollTimeline,
} from './types';

/**
 * CSS variable holding the table's horizontal scroll offset, which every cell inside the scroller inherits. Used only by
 * browsers without scroll-driven animations; the others move frozen cells with the animation below.
 */
const SCROLL_OFFSET_VARIABLE = '--search-table-scroll-x';

/** CSS variable holding how far the table can scroll horizontally, which the scroll-driven animation translates up to. */
const MAX_SCROLL_OFFSET_VARIABLE = '--search-table-max-scroll-x';

/** Scroll timeline the horizontal scroller exposes to the frozen cells inside it. */
const SCROLL_TIMELINE_NAME = '--search-table-x';

const FROZEN_CELL_ANIMATION_NAME = 'search-table-frozen-cell';

const FROZEN_STYLESHEET_ID = 'search-table-frozen-columns';

/**
 * Frozen cells are moved by a scroll-driven animation, which the browser runs on the compositor in the same frame as the
 * scroll, so they never trail behind it. A violation message is the second child of its frozen row and moves with it.
 */
const FROZEN_STYLESHEET = `
@supports (animation-timeline: scroll()) {
    @keyframes ${FROZEN_CELL_ANIMATION_NAME} {
        from { transform: translateX(0px); }
        to { transform: translateX(var(${MAX_SCROLL_OFFSET_VARIABLE}, 0px)); }
    }
    [data-frozen-cell], [data-frozen-row] > :nth-child(2) {
        animation: ${FROZEN_CELL_ANIMATION_NAME} linear both;
        animation-timeline: ${SCROLL_TIMELINE_NAME};
    }
}
`;

const supportsScrollDrivenAnimations = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()');

/** Width of the `gap3` spacing between cells, and of the row padding to the left of the first cell. */
const CELL_GAP = 12;

/** Margin between the table and the page edge, which the margin overlay covers so nothing scrolls into it. */
const TABLE_MARGIN = 20;

/**
 * Data attributes marking frozen elements, rendered as `data-frozen-cell`, `data-frozen-edge` and `data-frozen-row`. The
 * edge overlay is measured from the edge cell and the rows; the stylesheet animates the cells and rows.
 */
const FROZEN_CELL_DATA_KEY = 'frozenCell';
const FROZEN_EDGE_DATA_KEY = 'frozenEdge';
const FROZEN_ROW_DATA_KEY = 'frozenRow';

/** Soft shadow cast to the right of the frozen edge, so the frozen area reads as floating above the scrolled cells. */
const FROZEN_EDGE_SHADOW = '2px 0 8px rgba(0, 0, 0, 0.12)';

/** A single line down the whole table at the frozen edge, so the border and its shadow read as one continuous edge. */
const getFrozenEdgeOverlayStyle: GetFrozenEdgeOverlayStyle = (position, borderColor) =>
    ({
        position: 'absolute',
        left: position.left - 1,
        top: position.top,
        height: position.height,
        width: 1,
        zIndex: 2,
        pointerEvents: 'none',
        backgroundColor: borderColor,
        boxShadow: FROZEN_EDGE_SHADOW,
        // Only the shadow to the right of the line shows; the frozen area stays unshaded.
        clipPath: 'inset(0 -16px 0 0)',
    }) as ViewStyle;

/** Covers the page margin left of the table, where row backgrounds and separators would otherwise scroll into view. */
const getFrozenMarginOverlayStyle: GetFrozenMarginOverlayStyle = (position, backgroundColor) =>
    ({
        position: 'absolute',
        left: 0,
        top: position.top,
        height: position.height,
        width: TABLE_MARGIN,
        zIndex: 2,
        pointerEvents: 'none',
        backgroundColor,
    }) as ViewStyle;

const getFrozenTranslateStyle: GetFrozenTranslateStyle = () => ({transform: `translateX(var(${SCROLL_OFFSET_VARIABLE}, 0px))`}) as ViewStyle;

/**
 * Shifts a frozen cell right by however far the table has scrolled, so it stays in place while the other cells scroll
 * beneath it. The cell stretches to the row's height, and box shadows in its background fill the gaps beside it, which
 * no cell owns, without reaching the row separators.
 */
const getFrozenCellStyle: GetFrozenCellStyle = ({backgroundColor, isLastFrozen, verticalBleed = 0, isRowDirection = false}) => {
    const verticalOffsets = verticalBleed > 0 ? [0, -verticalBleed, verticalBleed] : [0];
    const fillShadows: string[] = [];

    for (const offsetY of verticalOffsets) {
        fillShadows.push(`-${CELL_GAP}px ${offsetY}px 0 0 ${backgroundColor}`);
        if (!isLastFrozen) {
            fillShadows.push(`${CELL_GAP}px ${offsetY}px 0 0 ${backgroundColor}`);
        }
        if (offsetY !== 0) {
            fillShadows.push(`0 ${offsetY}px 0 0 ${backgroundColor}`);
        }
    }

    return {
        ...getFrozenTranslateStyle(),
        zIndex: 1,
        alignSelf: 'stretch',
        ...(isRowDirection ? {alignItems: 'center'} : {justifyContent: 'center'}),
        backgroundColor,
        boxShadow: fillShadows.join(', '),
    } as ViewStyle;
};

const setFrozenScrollOffset: SetFrozenScrollOffset = (scrollableNode, offsetX) => {
    if (supportsScrollDrivenAnimations || !(scrollableNode instanceof HTMLElement)) {
        return;
    }
    scrollableNode.style.setProperty(SCROLL_OFFSET_VARIABLE, `${offsetX}px`);
};

/** Exposes the scroller's scroll timeline and range to the frozen cells, adding the stylesheet that animates them once. */
const syncFrozenScrollTimeline: SyncFrozenScrollTimeline = (scrollableNode) => {
    if (!supportsScrollDrivenAnimations || !(scrollableNode instanceof HTMLElement)) {
        return;
    }
    if (!document.getElementById(FROZEN_STYLESHEET_ID)) {
        const stylesheet = document.createElement('style');
        stylesheet.id = FROZEN_STYLESHEET_ID;
        stylesheet.textContent = FROZEN_STYLESHEET;
        document.head.appendChild(stylesheet);
    }
    scrollableNode.style.setProperty('scroll-timeline', `${SCROLL_TIMELINE_NAME} x`);
    scrollableNode.style.setProperty(MAX_SCROLL_OFFSET_VARIABLE, `${scrollableNode.scrollWidth - scrollableNode.clientWidth}px`);
};

/**
 * Finds where the frozen area's right edge runs, from the frozen header cell marking it down to the bottom of the last
 * rendered row, clamped to the container so a long list ends at the visible bottom.
 */
const measureFrozenEdge: MeasureFrozenEdge = (container, scrollableNode, headerVerticalBleed) => {
    if (!(container instanceof HTMLElement)) {
        return null;
    }
    const edgeCell = container.querySelector('[data-frozen-edge="true"]');
    if (!edgeCell) {
        return null;
    }
    const containerRect = container.getBoundingClientRect();
    const edgeRect = edgeCell.getBoundingClientRect();

    // The cell's on-screen position includes whatever shift it has right now, which may not have caught up with the
    // scroll yet (a scroll-driven animation that just started, say). Undoing that shift and applying the real scroll
    // offset gives where the frozen edge settles.
    const appliedShift = new DOMMatrixReadOnly(getComputedStyle(edgeCell).transform).m41;
    const scrollOffset = scrollableNode instanceof HTMLElement ? scrollableNode.scrollLeft : 0;

    let bottom = edgeRect.bottom + headerVerticalBleed;
    for (const row of container.querySelectorAll('[data-frozen-row]')) {
        bottom = Math.max(bottom, row.getBoundingClientRect().bottom);
    }
    const top = edgeRect.top - headerVerticalBleed - containerRect.top;
    return {
        left: edgeRect.right - appliedShift + scrollOffset - containerRect.left,
        top,
        height: Math.min(bottom, containerRect.bottom) - containerRect.top - top,
    };
};

export {
    FROZEN_CELL_DATA_KEY,
    FROZEN_EDGE_DATA_KEY,
    FROZEN_ROW_DATA_KEY,
    getFrozenCellStyle,
    getFrozenEdgeOverlayStyle,
    getFrozenMarginOverlayStyle,
    getFrozenTranslateStyle,
    measureFrozenEdge,
    setFrozenScrollOffset,
    syncFrozenScrollTimeline,
};
