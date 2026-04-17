import type {OnyxEntry} from 'react-native-onyx';
import {isActionableTrackExpense, isCreatedAction, isCreatedTaskReportAction, isDeletedAction, isMoneyRequestAction, isReportPreviewAction, isWhisperAction} from '@libs/ReportActionsUtils';
import {getChildReportNotificationPreference, shouldDisplayThreadReplies} from '@libs/ReportUtils';
import type {ReportAction} from '@src/types/onyx';

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

// eslint-disable-next-line import/prefer-default-export -- named utility export per module convention
export {shouldShowLeaveThreadAction};
