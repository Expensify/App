import type {ViewStyle} from 'react-native';

import type {
    FrozenSide,
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
 * browsers without scroll-driven animations; the others move frozen cells with the animations below.
 */
const SCROLL_OFFSET_VARIABLE = '--search-table-scroll-x';

/** CSS variable holding how far the table can scroll horizontally, which the frozen cells translate across. */
const MAX_SCROLL_OFFSET_VARIABLE = '--search-table-max-scroll-x';

/** Scroll timeline the horizontal scroller exposes to the frozen cells inside it. */
const SCROLL_TIMELINE_NAME = '--search-table-x';

const FROZEN_LEFT_CELL_ANIMATION_NAME = 'search-table-frozen-cell';

const FROZEN_RIGHT_CELL_ANIMATION_NAME = 'search-table-frozen-right-cell';

const FROZEN_STYLESHEET_ID = 'search-table-frozen-columns';

/**
 * Frozen cells are moved by scroll-driven animations, which the browser runs on the compositor in the same frame as the
 * scroll, so they never trail behind it. Left-frozen cells shift right by the scroll offset; right-frozen cells start
 * shifted left by the full scroll range and come back to their place as the table reaches its end. A violation message
 * is the second child of a row with left-frozen cells and moves with them.
 */
const FROZEN_STYLESHEET = `
@supports (animation-timeline: scroll()) {
    @keyframes ${FROZEN_LEFT_CELL_ANIMATION_NAME} {
        from { transform: translateX(0px); }
        to { transform: translateX(var(${MAX_SCROLL_OFFSET_VARIABLE}, 0px)); }
    }
    @keyframes ${FROZEN_RIGHT_CELL_ANIMATION_NAME} {
        from { transform: translateX(calc(-1 * var(${MAX_SCROLL_OFFSET_VARIABLE}, 0px))); }
        to { transform: translateX(0px); }
    }
    [data-frozen-cell], [data-frozen-row-message] > :nth-child(2) {
        animation: ${FROZEN_LEFT_CELL_ANIMATION_NAME} linear both;
        animation-timeline: ${SCROLL_TIMELINE_NAME};
    }
    [data-frozen-right-cell] {
        animation: ${FROZEN_RIGHT_CELL_ANIMATION_NAME} linear both;
        animation-timeline: ${SCROLL_TIMELINE_NAME};
    }
}
`;

const supportsScrollDrivenAnimations = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()');

/** Width of the `gap3` spacing between cells, and of the row padding beside the first and last cells. */
const CELL_GAP = 12;

/** Inner padding on the edge cell's side facing the frozen edge, so its content doesn't run up against the edge line. */
const FROZEN_EDGE_CELL_PADDING = 8;

/** Margin between the table and the page edges, which the margin overlays cover so nothing scrolls into them. */
const TABLE_MARGIN = 20;

/**
 * Data attributes marking frozen elements, rendered as `data-frozen-cell`, `data-frozen-right-cell`,
 * `data-frozen-edge-left`, `data-frozen-edge-right`, `data-frozen-row` and `data-frozen-row-message`. The edge overlays
 * are measured from the edge cells and the rows; the stylesheet animates the cells and the violation messages of rows
 * marked with the message key.
 */
const FROZEN_CELL_DATA_KEY = 'frozenCell';
const FROZEN_RIGHT_CELL_DATA_KEY = 'frozenRightCell';
const FROZEN_EDGE_LEFT_DATA_KEY = 'frozenEdgeLeft';
const FROZEN_EDGE_RIGHT_DATA_KEY = 'frozenEdgeRight';
const FROZEN_ROW_DATA_KEY = 'frozenRow';
const FROZEN_ROW_MESSAGE_DATA_KEY = 'frozenRowMessage';

/** Soft shadow cast away from the frozen area, so it reads as floating above the scrolled cells. */
const FROZEN_EDGE_SHADOW: Record<FrozenSide, string> = {
    left: '2px 0 8px rgba(0, 0, 0, 0.12)',
    right: '-2px 0 8px rgba(0, 0, 0, 0.12)',
};

/** Clips the shadow to the scrolling side of the line, so the frozen area stays unshaded. */
const FROZEN_EDGE_SHADOW_CLIP: Record<FrozenSide, string> = {
    left: 'inset(0 -16px 0 0)',
    right: 'inset(0 0 0 -16px)',
};

/** A single line down the whole table at a frozen edge, so the border and its shadow read as one continuous edge. */
const getFrozenEdgeOverlayStyle: GetFrozenEdgeOverlayStyle = (position, borderColor, side) =>
    ({
        position: 'absolute',
        left: side === 'left' ? position.left - 1 : position.left,
        top: position.top,
        height: position.height,
        width: 1,
        zIndex: 2,
        pointerEvents: 'none',
        backgroundColor: borderColor,
        boxShadow: FROZEN_EDGE_SHADOW[side],
        clipPath: FROZEN_EDGE_SHADOW_CLIP[side],
    }) as ViewStyle;

/** Covers the page margin beside the table, where row backgrounds and separators would otherwise scroll into view. */
const getFrozenMarginOverlayStyle: GetFrozenMarginOverlayStyle = (position, backgroundColor, side) =>
    ({
        position: 'absolute',
        ...(side === 'left' ? {left: 0} : {right: 0}),
        top: position.top,
        height: position.height,
        width: TABLE_MARGIN,
        zIndex: 2,
        pointerEvents: 'none',
        backgroundColor,
    }) as ViewStyle;

const getFrozenTranslateStyle: GetFrozenTranslateStyle = () => ({transform: `translateX(var(${SCROLL_OFFSET_VARIABLE}, 0px))`}) as ViewStyle;

const getFrozenRightTranslateStyle = () => ({transform: `translateX(calc(var(${SCROLL_OFFSET_VARIABLE}, 0px) - var(${MAX_SCROLL_OFFSET_VARIABLE}, 0px)))`}) as ViewStyle;

/**
 * Shifts a frozen cell so it stays in place while the other cells scroll beneath it. The cell stretches to the row's
 * height, and box shadows in its background fill the gaps beside it, which no cell owns, without reaching the row
 * separators. The gap on the edge side is left to the frozen edge overlay, and the edge cell pads its content away from it.
 */
const getFrozenCellStyle: GetFrozenCellStyle = ({backgroundColor, side, isEdge, verticalBleed = 0, isRowDirection = false, sizing}) => {
    const verticalOffsets = verticalBleed > 0 ? [0, -verticalBleed, verticalBleed] : [0];
    const outerGap = side === 'left' ? -CELL_GAP : CELL_GAP;
    const fillShadows: string[] = [];

    for (const offsetY of verticalOffsets) {
        fillShadows.push(`${outerGap}px ${offsetY}px 0 0 ${backgroundColor}`);
        if (!isEdge) {
            fillShadows.push(`${-outerGap}px ${offsetY}px 0 0 ${backgroundColor}`);
        }
        if (offsetY !== 0) {
            fillShadows.push(`0 ${offsetY}px 0 0 ${backgroundColor}`);
        }
    }

    const edgePaddingStyle: ViewStyle = {};
    if (isEdge) {
        edgePaddingStyle[side === 'left' ? 'paddingRight' : 'paddingLeft'] = FROZEN_EDGE_CELL_PADDING;
        for (const property of ['width', 'minWidth', 'flexBasis'] as const) {
            const value = sizing?.[property];
            if (typeof value === 'number') {
                edgePaddingStyle[property] = value + FROZEN_EDGE_CELL_PADDING;
            }
        }
    }

    return {
        ...(side === 'left' ? getFrozenTranslateStyle() : getFrozenRightTranslateStyle()),
        ...edgePaddingStyle,
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

/**
 * Exposes the scroller's range to the frozen cells, plus its scroll timeline where scroll-driven animations are
 * supported, adding the stylesheet that animates them once.
 */
const syncFrozenScrollTimeline: SyncFrozenScrollTimeline = (scrollableNode) => {
    if (!(scrollableNode instanceof HTMLElement)) {
        return;
    }
    scrollableNode.style.setProperty(MAX_SCROLL_OFFSET_VARIABLE, `${scrollableNode.scrollWidth - scrollableNode.clientWidth}px`);
    if (!supportsScrollDrivenAnimations) {
        return;
    }
    if (!document.getElementById(FROZEN_STYLESHEET_ID)) {
        const stylesheet = document.createElement('style');
        stylesheet.id = FROZEN_STYLESHEET_ID;
        stylesheet.textContent = FROZEN_STYLESHEET;
        document.head.appendChild(stylesheet);
    }
    scrollableNode.style.setProperty('scroll-timeline', `${SCROLL_TIMELINE_NAME} x`);
};

/**
 * Finds where a frozen area's inner edge runs, from the frozen header cell marking it down to the bottom of the last
 * rendered row, clamped to the container so a long list ends at the visible bottom.
 */
const measureFrozenEdge: MeasureFrozenEdge = (container, scrollableNode, headerVerticalBleed, side) => {
    if (!(container instanceof HTMLElement)) {
        return null;
    }
    const edgeCell = container.querySelector(side === 'left' ? '[data-frozen-edge-left="true"]' : '[data-frozen-edge-right="true"]');
    if (!edgeCell) {
        return null;
    }
    const containerRect = container.getBoundingClientRect();
    const edgeRect = edgeCell.getBoundingClientRect();

    // The cell's on-screen position includes whatever shift it has right now, which may not have caught up with the
    // scroll yet (a scroll-driven animation that just started, say). Undoing that shift gives the cell's place in the
    // scrolled content, and applying the shift it settles at for the real scroll offset gives where the edge rests:
    // left-frozen cells settle at their place before scrolling, right-frozen cells that far minus the full scroll range.
    const appliedShift = new DOMMatrixReadOnly(getComputedStyle(edgeCell).transform).m41;
    const scrollOffset = scrollableNode instanceof HTMLElement ? scrollableNode.scrollLeft : 0;
    const maxScrollOffset = scrollableNode instanceof HTMLElement ? scrollableNode.scrollWidth - scrollableNode.clientWidth : 0;
    const settledLeft = side === 'left' ? edgeRect.right - appliedShift + scrollOffset : edgeRect.left - appliedShift + scrollOffset - maxScrollOffset;

    let bottom = edgeRect.bottom + headerVerticalBleed;
    for (const row of container.querySelectorAll('[data-frozen-row]')) {
        bottom = Math.max(bottom, row.getBoundingClientRect().bottom);
    }
    const top = edgeRect.top - headerVerticalBleed - containerRect.top;
    return {
        left: settledLeft - containerRect.left,
        top,
        height: Math.min(bottom, containerRect.bottom) - containerRect.top - top,
    };
};

export {
    FROZEN_CELL_DATA_KEY,
    FROZEN_RIGHT_CELL_DATA_KEY,
    FROZEN_EDGE_LEFT_DATA_KEY,
    FROZEN_EDGE_RIGHT_DATA_KEY,
    FROZEN_ROW_DATA_KEY,
    FROZEN_ROW_MESSAGE_DATA_KEY,
    getFrozenCellStyle,
    getFrozenEdgeOverlayStyle,
    getFrozenMarginOverlayStyle,
    getFrozenTranslateStyle,
    measureFrozenEdge,
    setFrozenScrollOffset,
    syncFrozenScrollTimeline,
};
