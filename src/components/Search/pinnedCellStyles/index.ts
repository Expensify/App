/** Holds pinned cells in place with `position: sticky`, which browsers move in the same frame as the scroll. */
import {toViewStyle} from '@libs/WebOnlyStyleUtils';

import type {ViewStyle} from 'react-native';

import {getPinnedLeftVariable, PINNED_LEFT_LEAD_VARIABLE} from './pinnedScrollVariables';

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

// RN-web gives every View `z-index: 0`, a stacking context that would trap the pinned cells below their row's cover.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- `auto` is a valid CSS z-index the native types don't model.
const PINNED_CELL_CONTAINER_STYLE = {zIndex: 'auto'} as unknown as ViewStyle;

export {PINNED_LEAD_STYLE, PINNED_CELL_CONTAINER_STYLE, getPinnedColumnStyle, getPinnedInset};
