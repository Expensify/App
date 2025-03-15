import {createContext} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getOriginalReportID} from '@libs/ReportUtils';
import {showContextMenu} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {Report, ReportAction, ReportNameValuePairs} from '@src/types/onyx';

type ShowContextMenuContextProps = {
    anchor: ContextMenuAnchor;
    report: OnyxEntry<Report>;
    reportNameValuePairs: OnyxEntry<ReportNameValuePairs>;
    action: OnyxEntry<ReportAction>;
    transactionThreadReport?: OnyxEntry<Report>;
    checkIfContextMenuActive: () => void;
    isDisabled: boolean;
};

const ShowContextMenuContext = createContext<ShowContextMenuContextProps>({
    anchor: null,
    report: undefined,
    reportNameValuePairs: undefined,
    action: undefined,
    transactionThreadReport: undefined,
    checkIfContextMenuActive: () => {},
    isDisabled: false,
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
    anchor: ContextMenuAnchor,
    reportID: string | undefined,
    action: OnyxEntry<ReportAction>,
    checkIfContextMenuActive: () => void,
    isArchivedRoom = false,
) {
    if (!canUseTouchScreen()) {
        return;
    }

    showContextMenu({
        type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
        event,
        selection: '',
        contextMenuAnchor: anchor,
        report: {
            reportID,
            originalReportID: reportID ? getOriginalReportID(reportID, action) : undefined,
            isArchivedRoom,
        },
        reportAction: {
            reportActionID: action?.reportActionID,
        },
        callbacks: {
            onShow: checkIfContextMenuActive,
            onHide: checkIfContextMenuActive,
        },
    });
}

export {ShowContextMenuContext, showContextMenuForReport};
export type {ShowContextMenuContextProps};
