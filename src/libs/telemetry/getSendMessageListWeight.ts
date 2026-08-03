import {getSortedReportActionsForDisplay, isReportPreviewAction} from '@libs/ReportActionsUtils';

import type {ReportActions} from '@src/types/onyx';

type SendMessageListWeight = {
    /** Number of renderable actions in the report (display-filtered). */
    reportActionCount: number;

    /** How many of those renderable actions are `REPORT_PREVIEW` (MoneyRequestReportPreview) items. */
    moneyRequestPreviewCount: number;
};

/**
 * Counts the report's actions and preview cards for the `ManualSendMessage` span so we can group send latency
 * in Sentry by how "heavy" the chat is. We filter through `getSortedReportActionsForDisplay` to skip hidden/deleted
 * actions, and pass `reportID` so actions missing their own `reportID` aren't dropped (same as the report view does).
 *
 * This counts every cached action, which can be a bit more than what's actually mounted in the list. In practice the
 * gap is small: we only stamp this span when the user is scrolled to the bottom of a freshly-opened chat, where cached
 * ≈ mounted. It only really diverges if they scrolled far up (loading older pages) and then back down. Either way it's
 * fine here — this is a rough bucket for grouping send latency, not an exact render count.
 */
function getSendMessageListWeight(reportActions: ReportActions, reportID?: string, canUserPerformWriteAction?: boolean): SendMessageListWeight {
    const visibleReportActions = getSortedReportActionsForDisplay(reportActions, canUserPerformWriteAction, undefined, undefined, reportID);
    return {
        reportActionCount: visibleReportActions.length,
        moneyRequestPreviewCount: visibleReportActions.filter(isReportPreviewAction).length,
    };
}

export default getSendMessageListWeight;
