import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import {isActionableTrackExpense, isCreatedAction, isCreatedTaskReportAction, isDeletedAction, isMoneyRequestAction, isReportPreviewAction, isWhisperAction} from './ReportActionsUtils';
import {getChildReportNotificationPreference, shouldDisplayThreadReplies} from './ReportUtils';

type ThreadMenuParams = {
    reportAction: OnyxEntry<ReportAction>;
    isArchivedRoom: boolean;
    isThreadReportParentAction: boolean;
    isHarvestReport?: boolean;
};

/**
 * Determines if the "Join Thread" context menu option should be shown.
 * Shows when user is not subscribed to the thread and the action is eligible.
 */
function shouldShowJoinThread({reportAction, isArchivedRoom, isThreadReportParentAction, isHarvestReport}: ThreadMenuParams): boolean {
    const childReportNotificationPreference = getChildReportNotificationPreference(reportAction);
    const isDeletedActionResult = isDeletedAction(reportAction);
    const shouldDisplayThreadRepliesResult = shouldDisplayThreadReplies(reportAction, isThreadReportParentAction);
    const subscribed = childReportNotificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
    const isWhisperActionResult = isWhisperAction(reportAction) || isActionableTrackExpense(reportAction);
    const isExpenseReportAction = isMoneyRequestAction(reportAction) || isReportPreviewAction(reportAction);
    const isTaskAction = isCreatedTaskReportAction(reportAction);
    const isHarvestCreatedExpenseReportAction = isHarvestReport && isCreatedAction(reportAction);

    return (
        !subscribed &&
        !isWhisperActionResult &&
        !isTaskAction &&
        !isExpenseReportAction &&
        !isThreadReportParentAction &&
        !isHarvestCreatedExpenseReportAction &&
        (shouldDisplayThreadRepliesResult || (!isDeletedActionResult && !isArchivedRoom))
    );
}

/**
 * Determines if the "Leave Thread" context menu option should be shown.
 * Shows when user is subscribed to the thread and the action is eligible.
 */
function shouldShowLeaveThread({reportAction, isArchivedRoom, isThreadReportParentAction, isHarvestReport}: ThreadMenuParams & {isHarvestReport?: boolean}): boolean {
    const childReportNotificationPreference = getChildReportNotificationPreference(reportAction);
    const isDeletedActionResult = isDeletedAction(reportAction);
    const shouldDisplayThreadRepliesResult = shouldDisplayThreadReplies(reportAction, isThreadReportParentAction);
    const subscribed = childReportNotificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
    const isWhisperActionResult = isWhisperAction(reportAction) || isActionableTrackExpense(reportAction);
    const isExpenseReportAction = isMoneyRequestAction(reportAction) || isReportPreviewAction(reportAction);
    const isTaskAction = isCreatedTaskReportAction(reportAction);
    const isHarvestCreatedExpenseReportAction = isHarvestReport && isCreatedAction(reportAction);

    return (
        subscribed &&
        !isWhisperActionResult &&
        !isTaskAction &&
        !isExpenseReportAction &&
        !isThreadReportParentAction &&
        !isHarvestCreatedExpenseReportAction &&
        (shouldDisplayThreadRepliesResult || (!isDeletedActionResult && !isArchivedRoom))
    );
}

export {shouldShowJoinThread, shouldShowLeaveThread};
export type {ThreadMenuParams};
