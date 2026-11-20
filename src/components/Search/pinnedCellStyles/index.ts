/**
 * Holds a left-pinned Spend table cell in place while the table scrolls sideways. The scroller writes its offset into a CSS custom
 * property from its scroll handler, and the cell translates by it.
 */
import type {ViewStyle} from 'react-native';

import {PINNED_SCROLL_X_VARIABLE} from './pinnedScrollVariables';

// Above the row's cover, which sits above the cells scrolling beneath it.
const PINNED_START_CELL_STYLE: ViewStyle = {transform: `translateX(var(${PINNED_SCROLL_X_VARIABLE}, 0px))`, zIndex: 2};

// RN-web gives every View `z-index: 0`, which makes each one a stacking context and would trap the pinned cells below their row's cover.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- `auto` is a valid CSS z-index the native types don't model.
const PINNED_CELL_CONTAINER_STYLE = {zIndex: 'auto'} as unknown as ViewStyle;

export {PINNED_START_CELL_STYLE, PINNED_CELL_CONTAINER_STYLE};
