import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {getChildReportNotificationPreference} from '@libs/ReportUtils';
import {toggleSubscribeToChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createLeaveThreadAction(params: ContextMenuActionParams): ActionDescriptor {
    const {payload, icons} = params;
    const {reportAction, originalReport, currentUserAccountID, interceptAnonymousUser, hideAndRun, translate} = payload;

    return {
        id: 'leaveThread',
        icon: icons.Exit,
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
