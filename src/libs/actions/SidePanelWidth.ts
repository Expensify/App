import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/** Saves the width once a drag ends, since mid-drag widths only live in CSS. */
function setSidePanelWidth(width: number) {
    Onyx.set(ONYXKEYS.SIDE_PANEL_WIDTH, width);
}

/** Drops the saved width, so the side panel goes back to the default and follows it if the default changes. */
function resetSidePanelWidth() {
    Onyx.set(ONYXKEYS.SIDE_PANEL_WIDTH, null);
}

export {resetSidePanelWidth, setSidePanelWidth};
