import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

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

/** Shows another report, such as a thread, in the open side panel without leaving it. `null` returns to the panel's default chat. */
function setSidePanelReportID(reportID: string | null) {
    Onyx.merge(ONYXKEYS.NVP_SIDE_PANEL, {reportID});
}

/** Remembers where the side panel sits on a wide layout, so it comes back the same way after a refresh. */
function setSidePanelMode(mode: ValueOf<typeof CONST.SIDE_PANEL_MODE>) {
    Onyx.set(ONYXKEYS.SIDE_PANEL_MODE, mode);
}

export default {openSidePanel, closeSidePanel, dismissSidePanel, setSidePanelReportID, setSidePanelMode};
