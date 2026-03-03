import type {OnyxEntry} from 'react-native-onyx';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {isActionableTrackExpense, isCreatedAction, isCreatedTaskReportAction, isDeletedAction, isMoneyRequestAction, isReportPreviewAction, isWhisperAction} from '@libs/ReportActionsUtils';
import {getChildReportNotificationPreference, shouldDisplayThreadReplies} from '@libs/ReportUtils';
import {toggleSubscribeToChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ReportAction, Report as ReportType} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type LeaveThreadActionParams = BaseContextMenuActionParams & {
    reportAction: ReportAction;
    originalReport: OnyxEntry<ReportType>;
    currentUserAccountID: number;
    hideAndRun: (callback?: () => void) => void;
    exitIcon: IconAsset;
};

function shouldShowLeaveThreadAction({
    reportAction,
    isArchivedRoom,
    isThreadReportParentAction,
    isHarvestReport,
}: {
    reportAction: OnyxEntry<ReportAction>;
    isArchivedRoom: boolean;
    isThreadReportParentAction: boolean;
    isHarvestReport: boolean;
}): boolean {
    const childReportNotificationPreference = getChildReportNotificationPreference(reportAction);
    const isDeletedActionResult = isDeletedAction(reportAction);
    const shouldDisplayReplies = shouldDisplayThreadReplies(reportAction, isThreadReportParentAction);
    const subscribed = childReportNotificationPreference !== 'hidden';
    const isWhisper = isWhisperAction(reportAction) || isActionableTrackExpense(reportAction);
    const isExpenseReportAction = isMoneyRequestAction(reportAction) || isReportPreviewAction(reportAction);
    const isTaskAction = isCreatedTaskReportAction(reportAction);
    const isHarvestCreatedExpenseReportAction = !!isHarvestReport && isCreatedAction(reportAction);
    return (
        subscribed &&
        !isWhisper &&
        !isTaskAction &&
        !isExpenseReportAction &&
        !isThreadReportParentAction &&
        !isHarvestCreatedExpenseReportAction &&
        (shouldDisplayReplies || (!isDeletedActionResult && !isArchivedRoom))
    );
}

function createLeaveThreadAction({reportAction, originalReport, currentUserAccountID, hideAndRun, translate, exitIcon}: LeaveThreadActionParams): ContextMenuAction {
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
export {shouldShowLeaveThreadAction};
