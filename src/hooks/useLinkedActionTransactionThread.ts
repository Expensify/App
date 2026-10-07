import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

type UseLinkedActionTransactionThreadResult = {
    /** The one-transaction thread merged into this report, if it has one */
    linkedActionTransactionThreadReportID: string | undefined;

    /** Whether the linked action belongs to that thread rather than to the report itself */
    isLinkedActionInMergedTransactionThread: boolean;
};

/**
 * A linked action can belong to the one-transaction thread merged into a report rather than to the report itself, in which
 * case the report's own actions will never contain it. See issue #86919.
 */
function useLinkedActionTransactionThread(
    report: OnyxEntry<Report>,
    sortedAllReportActions: ReportAction[] | undefined,
    reportActionID: string | undefined,
): UseLinkedActionTransactionThreadResult {
    const {isOffline} = useNetwork();
    // Only subscribe when the route links to an action — most callers don't.
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportActionID ? getNonEmptyStringOnyxID(report?.chatReportID) : undefined}`);

    const linkedActionTransactionThreadReportID = reportActionID ? getOneTransactionThreadReportID(report, chatReport, sortedAllReportActions ?? [], isOffline) : undefined;

    const [isLinkedActionInMergedTransactionThread = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(linkedActionTransactionThreadReportID)}`, {
        selector: (actions: OnyxEntry<ReportActions>) => !!reportActionID && !!actions?.[reportActionID],
    });

    return {linkedActionTransactionThreadReportID, isLinkedActionInMergedTransactionThread};
}

export default useLinkedActionTransactionThread;
