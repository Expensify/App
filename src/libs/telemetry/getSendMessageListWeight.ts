import {getSortedReportActionsForDisplay, isReportPreviewAction} from '@libs/ReportActionsUtils';

import type {ReportActions} from '@src/types/onyx';

type SendMessageListWeight = {
    /** Number of renderable actions in the report (display-filtered, matching what the report view shows). */
    reportActionCount: number;

    /** How many of those renderable actions are `REPORT_PREVIEW` (MoneyRequestReportPreview) items. */
    moneyRequestPreviewCount: number;
};

/**
 * Computes the list-weight dimensions stamped on the `ManualSendMessage` span (`report_action_count`,
 * `money_request_preview_count`). Counts off the display-filtered actions (via `getSortedReportActionsForDisplay`)
 * so hidden/deleted previews don't inflate the numbers, letting Sentry segment send latency by how many
 * `MoneyRequestReportPreview` items the chat actually renders.
 */
function getSendMessageListWeight(reportActions: ReportActions, canUserPerformWriteAction?: boolean): SendMessageListWeight {
    const visibleReportActions = getSortedReportActionsForDisplay(reportActions, canUserPerformWriteAction);
    return {
        reportActionCount: visibleReportActions.length,
        moneyRequestPreviewCount: visibleReportActions.filter(isReportPreviewAction).length,
    };
}

export default getSendMessageListWeight;
