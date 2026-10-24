import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getOneTransactionThreadReportID, withDEWRoutedActionsObject} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxInputOrEntry, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {reportTypeAndParentIDsSelector} from '@selectors/Report';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useReportTransactionsCollection from './useReportTransactionsCollection';

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
    const {isOffline} = useNetwork();
    const reportActionID = reportAction?.reportActionID;
    const isThreadReportParentAction = reportAction?.childReportID?.toString() === reportID;

    const reportActionBelongsCurrentReportSelector = (actions: OnyxEntry<ReportActions>) => {
        if (!reportActionID) {
            return false;
        }
        if (Object.keys(actions?.[reportActionID] ?? {}).length > 0) {
            return true;
        }
        return Object.keys(withDEWRoutedActionsObject(actions)?.[reportActionID] ?? {}).length > 0;
    };
    const [reportActionBelongsCurrentReport = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {selector: reportActionBelongsCurrentReportSelector});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: reportTypeAndParentIDsSelector});

    // The full actions, chat report and transactions are only needed to find a merged transaction thread, so rows whose action is in the current report don't subscribe to them
    const lookupReportID = reportID && !reportActionBelongsCurrentReport && !isThreadReportParentAction && reportActionID ? reportID : undefined;
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${lookupReportID}`, {selector: withDEWRoutedActionsObject});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${lookupReportID ? report?.chatReportID : undefined}`);
    const allReportTransactions = useReportTransactionsCollection(lookupReportID);

    // This will only be found if the report with reportID is a report with a single transaction and we are merging reportActions
    let uniqueTransactionThreadReportID: string | undefined;
    if (lookupReportID) {
        const visibleTransactionsIDs = getAllNonDeletedTransactions(allReportTransactions, Object.values(reportActions ?? {}))
            .filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            .map((transaction) => transaction.transactionID);
        uniqueTransactionThreadReportID = getOneTransactionThreadReportID({type: report?.type}, chatReport, reportActions, isOffline, visibleTransactionsIDs);
    }

    const [uniqueTransactionThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${uniqueTransactionThreadReportID}`);

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
