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
 * A copied message link always points at the report that owns the action, which for a one-transaction expense is the
 * transaction thread. Opening that thread directly would hide the parent's system messages (e.g. "Submitted") and the
 * expense report's action buttons, so while the thread is still its parent's only transaction we redirect to the parent
 * and render the combined view instead.
 *
 * Evaluating this at open time rather than when the link is copied is what keeps previously copied links working: once the
 * report gains a second expense this returns false, and the thread opens on its own — which is still where the action
 * lives, so the link never breaks. See https://github.com/Expensify/App/issues/86919.
 */
function shouldRedirectLinkedActionToParentReport({report, parentReport, parentReportAction, reportActionIDFromRoute, isOffline}: ShouldRedirectLinkedActionToParentReportParams): boolean {
    if (!reportActionIDFromRoute || !report?.parentReportID || !isReportTransactionThread(report)) {
        return false;
    }

    return isOneTransactionThread(report, parentReport, parentReportAction, isOffline);
}

export default shouldRedirectLinkedActionToParentReport;
