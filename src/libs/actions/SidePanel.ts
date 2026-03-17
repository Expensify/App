import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Open the side panel
 *
 * @param shouldOpenOnNarrowScreen - Whether to open the side panel on narrow screen
 */
function openSidePanel(shouldOpenOnNarrowScreen: boolean) {
    Onyx.merge(ONYXKEYS.NVP_SIDE_PANEL, shouldOpenOnNarrowScreen ? {open: true, openNarrowScreen: true} : {open: true});
}

/**
 * Close the side panel
 *
 * @param shouldCloseOnNarrowScreen - Whether to close the side panel on narrow screen
 */
function closeSidePanel(shouldCloseOnNarrowScreen: boolean) {
    Onyx.merge(ONYXKEYS.NVP_SIDE_PANEL, shouldCloseOnNarrowScreen ? {openNarrowScreen: false} : {open: false});
}

export default {openSidePanel, closeSidePanel};
