import type ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/** The device-local keys that hold a resizable pane's dragged width. */
type PaneWidthOnyxKey = typeof ONYXKEYS.SINGLE_RHP_WIDTH | typeof ONYXKEYS.SIDE_PANEL_WIDTH;

/** Saves the width once a drag ends, since mid-drag widths only live in CSS. */
function setPaneWidth(onyxKey: PaneWidthOnyxKey, width: number) {
    Onyx.set(onyxKey, width);
}

/** Drops the saved width, so the pane goes back to its default and follows it if the default changes. */
function resetPaneWidth(onyxKey: PaneWidthOnyxKey) {
    Onyx.set(onyxKey, null);
}

export {resetPaneWidth, setPaneWidth};
export type {PaneWidthOnyxKey};
