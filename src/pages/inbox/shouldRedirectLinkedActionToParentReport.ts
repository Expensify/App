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
 * While a transaction thread is still its parent's only transaction, a linked action in it should open the parent's combined
 * view instead. Deciding this at open time keeps old links working: once a second expense is added this returns false and the
 * link opens the thread, where the action still lives.
 */
function shouldRedirectLinkedActionToParentReport({report, parentReport, parentReportAction, reportActionIDFromRoute, isOffline}: ShouldRedirectLinkedActionToParentReportParams): boolean {
    if (!reportActionIDFromRoute || !report?.parentReportID || !isReportTransactionThread(report)) {
        return false;
    }

    // isOneTransactionThread only counts the parent's cached IOU actions, so trust the server-provided count to veto.
    if ((parentReport?.transactionCount ?? 1) > 1) {
        return false;
    }

    return isOneTransactionThread(report, parentReport, parentReportAction, isOffline);
}

export default shouldRedirectLinkedActionToParentReport;
