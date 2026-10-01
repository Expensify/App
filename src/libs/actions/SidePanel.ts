import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/**
 * Open the side panel
 *
 * @param shouldOpenOnNarrowScreen - Whether to open the side panel on narrow screen
 * @param reportID - The report to show, defaulting to the Concierge chat
 */
function openSidePanel(shouldOpenOnNarrowScreen: boolean, forceConcierge = false, reportID?: string) {
    Onyx.merge(
        ONYXKEYS.NVP_SIDE_PANEL,
        shouldOpenOnNarrowScreen ? {open: true, openNarrowScreen: true, forceConcierge, reportID: reportID ?? null} : {open: true, forceConcierge, reportID: reportID ?? null},
    );
}

/**
 * Close the side panel for the current layout flow.
 *
 * @param shouldCloseOnNarrowScreen - Whether to close the side panel on narrow screen
 */
function closeSidePanel(shouldCloseOnNarrowScreen: boolean) {
    Onyx.merge(ONYXKEYS.NVP_SIDE_PANEL, shouldCloseOnNarrowScreen ? {openNarrowScreen: false, forceConcierge: false, reportID: null} : {open: false, forceConcierge: false, reportID: null});
}

/**
 * Explicitly dismiss the side panel across all layouts.
 */
function dismissSidePanel() {
    Onyx.merge(ONYXKEYS.NVP_SIDE_PANEL, {open: false, openNarrowScreen: false, forceConcierge: false, reportID: null});
}

export default {openSidePanel, closeSidePanel, dismissSidePanel};
