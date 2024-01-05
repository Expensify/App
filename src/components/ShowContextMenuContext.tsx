import React from 'react';
import type {GestureResponderEvent, Text as RNText} from 'react-native';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as ReportUtils from '@libs/ReportUtils';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type ReportAction from '@src/types/onyx/ReportAction';

const ShowContextMenuContext = React.createContext({
    anchor: null,
    report: null,
    action: undefined,
    checkIfContextMenuActive: () => {},
});

ShowContextMenuContext.displayName = 'ShowContextMenuContext';

/**
 * Show the report action context menu.
 *
 * @param event - Press event object
 * @param anchor - Context menu anchor
 * @param reportID - Active Report ID
 * @param action - ReportAction for ContextMenu
 * @param checkIfContextMenuActive Callback to update context menu active state
 * @param isArchivedRoom - Is the report an archived room
 */
function showContextMenuForReport(
    event: GestureResponderEvent | MouseEvent,
    anchor: RNText | null,
    reportID: string,
    action: ReportAction,
    checkIfContextMenuActive: () => void,
    isArchivedRoom = false,
) {
    if (!DeviceCapabilities.canUseTouchScreen()) {
        return;
    }

    ReportActionContextMenu.showContextMenu(
        CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
        event,
        '',
        anchor,
        reportID,
        action.reportActionID,
        ReportUtils.getOriginalReportID(reportID, action),
        undefined,
        checkIfContextMenuActive,
        checkIfContextMenuActive,
        isArchivedRoom,
    );
}

export {ShowContextMenuContext, showContextMenuForReport};
