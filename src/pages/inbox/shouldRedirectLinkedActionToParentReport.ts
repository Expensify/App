import {isOneTransactionThread, isReportTransactionThread} from '@libs/ReportUtils';

import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type ShouldRedirectLinkedActionToParentReportParams = {
    /** The report the route currently points at */
    report: OnyxEntry<Report>;

    /** The parent of `report`, if it has one */
    parentReport: OnyxEntry<Report>;

    /** The action in the parent report that created `report` */
    parentReportAction: OnyxEntry<ReportAction>;

    /** The linked action ID from the route, if the route is a message link */
    reportActionIDFromRoute: string | undefined;

    isOffline: boolean;
};

/**
 * A copied message link points at the report that owns the action — the transaction thread for a one-transaction expense.
 * While that thread is still the parent's only transaction we open the parent instead, so its "Submitted" message and
 * action buttons are shown. Deciding this at open time keeps old links working: once the report gains a second expense
 * this returns false and the link simply opens the thread, where the action still lives. See issue #86919.
 */
function shouldRedirectLinkedActionToParentReport({report, parentReport, parentReportAction, reportActionIDFromRoute, isOffline}: ShouldRedirectLinkedActionToParentReportParams): boolean {
    if (!reportActionIDFromRoute || !report?.parentReportID || !isReportTransactionThread(report)) {
        return false;
    }

    // isOneTransactionThread counts the parent's *cached* IOU actions, so a partially cached parent can still look
    // one-transaction. transactionCount is server-provided, so trust it to veto: the redirect replaces the durable thread
    // URL, and we shouldn't make that call when the parent is already known to hold more than one transaction.
    if ((parentReport?.transactionCount ?? 1) > 1) {
        return false;
    }

    return isOneTransactionThread(report, parentReport, parentReportAction, isOffline);
}

export default shouldRedirectLinkedActionToParentReport;
