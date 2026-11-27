/** Holds pinned cells in place with `position: sticky`, which browsers move in the same frame as the scroll. */
import {toDimensionValue, toViewStyle} from '@libs/WebOnlyStyleUtils';

import variables from '@styles/variables';

import type {ViewStyle} from 'react-native';

import {getPinnedLeftVariable, PINNED_LEFT_LEAD_VARIABLE, PINNED_LINE_WIDTH_VARIABLE} from './pinnedScrollVariables';

/** Above the row's cover, which sits above the cells scrolling beneath it. */
const PINNED_CELL_Z_INDEX = 2;

/** Where a pinned box sticks: `restingOffset`, a CSS length for where it rests, so it never moves. */
function getPinnedInset(restingOffset: string) {
    return `calc(${restingOffset})`;
}

function getPinnedStickyStyle(leftVariable: string): ViewStyle {
    return toViewStyle({position: 'sticky', left: getPinnedInset(`var(${leftVariable}, 0px)`), zIndex: PINNED_CELL_Z_INDEX});
}

const PINNED_LEAD_STYLE = getPinnedStickyStyle(PINNED_LEFT_LEAD_VARIABLE);

const pinnedColumnStyles: ViewStyle[] = [];

/** Built once per position, so a cell keeps the same style object across renders. */
function getPinnedColumnStyle(pinIndex: number): ViewStyle {
    pinnedColumnStyles[pinIndex] ??= getPinnedStickyStyle(getPinnedLeftVariable(pinIndex));
    return pinnedColumnStyles[pinIndex];
}

/**
 * Ends a row's error line where the pins do. The width is only set while the table overflows; otherwise the calc is invalid and
 * the line keeps its full width.
 *
 * @param rowPaddingHorizontal The row's padding, which the line starts after.
 */
function getPinnedStartLineStyle(rowPaddingHorizontal: number): ViewStyle {
    return {
        ...PINNED_LEAD_STYLE,
        maxWidth: toDimensionValue(`calc(var(${PINNED_LINE_WIDTH_VARIABLE}) - ${rowPaddingHorizontal + variables.searchTableColumnGap}px)`),
    };
}

// RN-web gives every View `z-index: 0`, a stacking context that would trap the pinned cells below their row's cover.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- `auto` is a valid CSS z-index the native types don't model.
const PINNED_CELL_CONTAINER_STYLE = {zIndex: 'auto'} as unknown as ViewStyle;

export {PINNED_LEAD_STYLE, PINNED_CELL_CONTAINER_STYLE, getPinnedColumnStyle, getPinnedInset, getPinnedStartLineStyle};
