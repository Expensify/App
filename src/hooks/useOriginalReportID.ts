import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getOneTransactionThreadReportID, withDEWRoutedActionsObject} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxInputOrEntry, ReportAction} from '@src/types/onyx';

import {useMemo} from 'react';
import {useOnyxState} from 'react-native-onyx';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useOnyxStateSnapshotKey, {getSnapshotAwareValue} from './useOnyxStateSnapshotKey';
import useReportTransactionsCollection from './useReportTransactionsCollection';

type ReportOriginInfo = {
    reportActionBelongsCurrentReport: boolean;
    reportType: string | undefined;
    chatReportID: string | undefined;
    parentReportID: string | undefined;
};

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
    const reportActionID = reportAction?.reportActionID;
    const snapshotKey = useOnyxStateSnapshotKey();
    const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const;
    const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}` as const;
    const {reportActionBelongsCurrentReport, reportType, chatReportID, parentReportID} = useOnyxState(
        (state): ReportOriginInfo => {
            const report = getSnapshotAwareValue(state, snapshotKey, reportKey);
            const actions = getSnapshotAwareValue(state, snapshotKey, reportActionsKey);
            let belongs = false;
            if (reportActionID) {
                belongs = Object.keys(actions?.[reportActionID] ?? {}).length > 0 || Object.keys(withDEWRoutedActionsObject(actions)?.[reportActionID] ?? {}).length > 0;
            }
            return {reportActionBelongsCurrentReport: belongs, reportType: report?.type, chatReportID: report?.chatReportID, parentReportID: report?.parentReportID};
        },
        {dependencies: snapshotKey ? [snapshotKey] : [reportKey, reportActionsKey]},
    );
    const isThreadReportParentAction = reportAction?.childReportID?.toString() === reportID;

    // The full actions, chat report and transactions are only needed to find a merged transaction thread, so rows whose action is in the current report don't subscribe to them
    const lookupReportID = reportID && !reportActionBelongsCurrentReport && !isThreadReportParentAction && reportActionID ? reportID : undefined;
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${lookupReportID}`, {selector: withDEWRoutedActionsObject});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${lookupReportID ? chatReportID : undefined}`);
    const {isOffline} = useNetwork();
    const allReportTransactions = useReportTransactionsCollection(lookupReportID);

    // This will only be found if the report with reportID is a report with a single transaction and we are merging reportActions
    const uniqueTransactionThreadReportID = useMemo(() => {
        if (!lookupReportID) {
            return undefined;
        }

        const visibleTransactionsIDs = getAllNonDeletedTransactions(allReportTransactions, Object.values(reportActions ?? {}))
            .filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            .map((transaction) => transaction.transactionID);
        return getOneTransactionThreadReportID({type: reportType}, chatReport, reportActions ?? ([] as ReportAction[]), isOffline, visibleTransactionsIDs);
    }, [lookupReportID, allReportTransactions, reportActions, reportType, chatReport, isOffline]);

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
        return parentReportID;
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
