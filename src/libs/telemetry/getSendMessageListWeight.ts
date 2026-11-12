import {getVisibleReportActionsForDisplay, isReportPreviewAction, withDEWRoutedActionsArray} from '@libs/ReportActionsUtils';

import type {ReportActions} from '@src/types/onyx';

type SendMessageListWeight = {
    /** Number of renderable actions in the report (display-filtered). */
    reportActionCount: number;

    /** How many of those renderable actions are `REPORT_PREVIEW` (MoneyRequestReportPreview) items. */
    moneyRequestPreviewCount: number;
};

/**
 * Counts the report's actions and preview cards for the `ManualSendMessageVisible` span so we can group send latency
 * in Sentry by how "heavy" the chat is. We count the actions `getSortedReportActionsForDisplay` would show, skipping hidden/deleted
 * actions, and pass `reportID` so actions missing their own `reportID` aren't dropped (same as the report view does). Counting needs no
 * order, so this skips the sort, which would otherwise run on the send path before the message is added.
 *
 * This counts every cached action, which can be a bit more than what's actually mounted in the list. In practice the
 * gap is small: we only stamp this span when the user is scrolled to the bottom of a freshly-opened chat, where cached
 * ≈ mounted. It only really diverges if they scrolled far up (loading older pages) and then back down. Either way it's
 * fine here — this is a rough bucket for grouping send latency, not an exact render count.
 */
function getSendMessageListWeight(reportActions: ReportActions, reportID?: string, canUserPerformWriteAction?: boolean): SendMessageListWeight {
    const visibleReportActions = withDEWRoutedActionsArray(getVisibleReportActionsForDisplay(reportActions, canUserPerformWriteAction, undefined, reportID));
    return {
        reportActionCount: visibleReportActions.length,
        moneyRequestPreviewCount: visibleReportActions.filter(isReportPreviewAction).length,
    };
}

export default getSendMessageListWeight;
