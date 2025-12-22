import {useMemo} from 'react';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getOneTransactionThreadReportID, withDEWRoutedActionsObject} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxInputOrEntry, ReportAction} from '@src/types/onyx';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

/**
 * This hook is for finding the "original reportID" for a given reportActionID. The reportID usually is the report we are looking at,
 * and in most cases it will be the same as the original reportID. However, in these cases the original reportID is different:
 * - When viewing an expense report with a single transaction, the reportActions from the transaction thread and the expense report are merged, so in that case the
 * reportAction's report may be different from the report we are viewing.
 * - When viewing a thread report, the original reportID is the parent reportID, because the reportAction that created the thread belongs to the parent report.
 *
 * @param reportID The reportID of the report we are viewing
 * @param reportAction The reportAction we want to find the original reportID for
 * @returns The original reportID for the given reportAction, or undefined if not found
 *
 */
function useOriginalReportID(reportID: string | undefined, reportAction: OnyxInputOrEntry<Pick<ReportAction, 'reportActionID' | 'childReportID'>>): string | undefined {
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canBeMissing: true, selector: withDEWRoutedActionsObject});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`, {canBeMissing: true});
    const {isOffline} = useNetwork();
    const {transactions: allReportTransactions} = useTransactionsAndViolationsForReport(reportID);

    const reportActionID = reportAction?.reportActionID;
    const currentReportAction = reportActionID ? reportActions?.[reportActionID] : undefined;
    const reportActionBelongsCurrentReport = Object.keys(currentReportAction ?? {}).length > 0;
    const isThreadReportParentAction = reportAction?.childReportID?.toString() === reportID;

    // This will only be found if the report with reportID is a report with a single transaction and we are merging reportActions
    const uniqueTransactionThreadReportID = useMemo(() => {
        // These conditions are repeated with the conditions that make us return early below because there is no need to do expensive calculations
        // on the transactions and reportActions if we are not going to use uniqueTransactionThreadReportID.
        if (!reportID || reportActionBelongsCurrentReport || isThreadReportParentAction || !reportActionID) {
            return undefined;
        }

        const visibleTransactionsIDs = getAllNonDeletedTransactions(allReportTransactions, Object.values(reportActions ?? {}))
            .filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            .map((transaction) => transaction.transactionID);
        return getOneTransactionThreadReportID({type: report?.type}, chatReport, reportActions ?? ([] as ReportAction[]), isOffline, visibleTransactionsIDs);
    }, [reportID, reportActionBelongsCurrentReport, isThreadReportParentAction, reportActionID, allReportTransactions, reportActions, report?.type, chatReport, isOffline]);

    const [uniqueTransactionThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${uniqueTransactionThreadReportID}`, {canBeMissing: true});

    if (!reportID) {
        return undefined;
    }
    if (reportActionBelongsCurrentReport) {
        // the reportActionID does belong to reportID
        return reportID;
    }

    if (isThreadReportParentAction) {
        // This reportAction is the parent action of a thread report, so the original reportID is the parentReportID
        return report?.parentReportID;
    }

    // If we have a uniqueTransactionThreadReportID, then we are viewing an expense report with a single transaction and merging reportActions
    // In that case, we need to check if the reportActionID belongs to the transaction thread.
    if (uniqueTransactionThreadReportID && reportActionID) {
        const uniqueTransactionThreadReportAction = uniqueTransactionThreadReportActions?.[reportActionID];
        if (Object.keys(uniqueTransactionThreadReportAction ?? {}).length > 0) {
            return uniqueTransactionThreadReportID;
        }
    }

    // If we reach here, we couldn't find the original reportID
    return undefined;
}

export default useOriginalReportID;
