import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {CloseSidePanelParams, OpenSidePanelParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Open the side panel
 *
 * @param shouldOpenOnNarrowScreen - Whether to open the side panel on narrow screen
 */
function openSidePanel(shouldOpenOnNarrowScreen: boolean) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_SIDE_PANEL>> = [
        {
            key: ONYXKEYS.NVP_SIDE_PANEL,
            onyxMethod: Onyx.METHOD.MERGE,
            value: shouldOpenOnNarrowScreen ? {open: true, openNarrowScreen: true} : {open: true},
        },
    ];

    const params: OpenSidePanelParams = {isNarrowScreen: shouldOpenOnNarrowScreen};

    API.write(WRITE_COMMANDS.OPEN_SIDE_PANEL, params, {optimisticData});
}

/**
 * Close the side panel
 *
 * @param shouldCloseOnNarrowScreen - Whether to close the side panel on narrow screen
 */
function closeSidePanel(shouldCloseOnNarrowScreen: boolean) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_SIDE_PANEL>> = [
        {
            key: ONYXKEYS.NVP_SIDE_PANEL,
            onyxMethod: Onyx.METHOD.MERGE,
            value: shouldCloseOnNarrowScreen ? {openNarrowScreen: false} : {open: false},
        },
    ];

    const params: CloseSidePanelParams = {isNarrowScreen: shouldCloseOnNarrowScreen};

    API.write(WRITE_COMMANDS.CLOSE_SIDE_PANEL, params, {optimisticData});
}

export default {openSidePanel, closeSidePanel};
