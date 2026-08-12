import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/**
 * Open the side panel
 *
 * @param shouldOpenOnNarrowScreen - Whether to open the side panel on narrow screen
 */
function openSidePanel(shouldOpenOnNarrowScreen: boolean, forceConcierge = false) {
    Onyx.merge(ONYXKEYS.NVP_SIDE_PANEL, shouldOpenOnNarrowScreen ? {open: true, openNarrowScreen: true, forceConcierge} : {open: true, forceConcierge});
}

/**
 * Close the side panel for the current layout flow.
 *
 * @param shouldCloseOnNarrowScreen - Whether to close the side panel on narrow screen
 */
function closeSidePanel(shouldCloseOnNarrowScreen: boolean) {
    Onyx.merge(ONYXKEYS.NVP_SIDE_PANEL, shouldCloseOnNarrowScreen ? {openNarrowScreen: false, forceConcierge: false} : {open: false, forceConcierge: false});
}

/**
 * Explicitly dismiss the side panel across all layouts.
 */
function dismissSidePanel() {
    Onyx.merge(ONYXKEYS.NVP_SIDE_PANEL, {open: false, openNarrowScreen: false, forceConcierge: false});
}

export default {openSidePanel, closeSidePanel, dismissSidePanel};
