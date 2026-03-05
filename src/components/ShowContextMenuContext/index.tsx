import {createContext, useContext} from 'react';
import type {GestureResponderEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getOriginalReportID} from '@libs/ReportUtils';
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import {defaultShowContextMenuActionsContextValue, defaultShowContextMenuStateContextValue} from './default';
import type {ShowContextMenuActionsContextType, ShowContextMenuStateContextType} from './types';

const ShowContextMenuStateContext = createContext<ShowContextMenuStateContextType>(defaultShowContextMenuStateContextValue);
const ShowContextMenuActionsContext = createContext<ShowContextMenuActionsContextType>(defaultShowContextMenuActionsContextValue);

function useShowContextMenuState(): ShowContextMenuStateContextType {
    return useContext(ShowContextMenuStateContext);
}

function useShowContextMenuActions(): ShowContextMenuActionsContextType {
    return useContext(ShowContextMenuActionsContext);
}

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
            originalReportID: reportID ? getOriginalReportID(reportID, action, undefined) : undefined,
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

export {ShowContextMenuStateContext, ShowContextMenuActionsContext, useShowContextMenuState, useShowContextMenuActions, showContextMenuForReport};
export type {ShowContextMenuActionsContextType, ShowContextMenuStateContextType} from './types';
