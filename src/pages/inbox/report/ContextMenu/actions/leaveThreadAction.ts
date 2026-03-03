import type {OnyxEntry} from 'react-native-onyx';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {getChildReportNotificationPreference} from '@libs/ReportUtils';
import {toggleSubscribeToChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ReportAction, Report as ReportType} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type LeaveThreadActionParams = BaseContextMenuActionParams & {
    reportAction: ReportAction;
    originalReport: OnyxEntry<ReportType>;
    currentUserAccountID: number;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    hideAndRun: (callback?: () => void) => void;
    exitIcon: IconAsset;
};

function createLeaveThreadAction({reportAction, originalReport, currentUserAccountID, interceptAnonymousUser, hideAndRun, translate, exitIcon}: LeaveThreadActionParams): ContextMenuAction {
    return {
        id: 'leaveThread',
        icon: exitIcon,
        text: translate('reportActionContextMenu.leaveThread'),
        onPress: () =>
            interceptAnonymousUser(() => {
                const childReportNotificationPreference = getChildReportNotificationPreference(reportAction);
                hideAndRun(() => {
                    ReportActionComposeFocusManager.focus();
                    toggleSubscribeToChildReport(reportAction?.childReportID, currentUserAccountID, reportAction, originalReport, childReportNotificationPreference);
                });
            }, false),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.LEAVE_THREAD,
    };
}

export default createLeaveThreadAction;
export type {LeaveThreadActionParams};
