import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getIsOffline} from '@libs/NetworkState';
import {getOneTransactionThreadReportID, withDEWRoutedActionsObject} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxInputOrEntry, ReportAction, Transaction} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

/**
 * Synchronous, event-time equivalent of `useOriginalReportID`. Reads from the Onyx cache so it can be
 * called inside event handlers without any render-bound subscriptions.
 *
 * This finds the "original reportID" for a given reportAction. The reportID usually is the report we are looking at,
 * and in most cases it will be the same as the original reportID. However, in these cases the original reportID is different:
 * - When viewing an expense report with a single transaction, the reportActions from the transaction thread and the expense report are merged, so in that case the
 * reportAction's report may be different from the report we are viewing.
 * - When viewing a thread report, the original reportID is the parent reportID, because the reportAction that created the thread belongs to the parent report.
 *
 * @param reportID The reportID of the report we are viewing
 * @param reportAction The reportAction we want to find the original reportID for
 * @returns The original reportID for the given reportAction, or undefined if not found
 */
function getOriginalReportIDSync(reportID: string | undefined, reportAction: OnyxInputOrEntry<Pick<ReportAction, 'reportActionID' | 'childReportID'>>): string | undefined {
    const reportActions = withDEWRoutedActionsObject(OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}` as const));
    const report = OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const);
    const chatReport = OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}` as const);
    const isOffline = getIsOffline();

    const reportActionID = reportAction?.reportActionID;
    const currentReportAction = reportActionID ? reportActions?.[reportActionID] : undefined;
    const reportActionBelongsCurrentReport = Object.keys(currentReportAction ?? {}).length > 0;
    const isThreadReportParentAction = reportAction?.childReportID?.toString() === reportID;

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

    if (reportActionID) {
        // uniqueTransactionThreadReportID will only be found if the report with reportID is a report with a single transaction and we are merging reportActions
        const allReportTransactions = OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS)?.[reportID]?.transactions ?? getEmptyObject<OnyxCollection<Transaction>>();
        const visibleTransactionsIDs = getAllNonDeletedTransactions(allReportTransactions, Object.values(reportActions ?? {}))
            .filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            .map((transaction) => transaction.transactionID);
        const uniqueTransactionThreadReportID = getOneTransactionThreadReportID({type: report?.type}, chatReport, reportActions ?? ([] as ReportAction[]), isOffline, visibleTransactionsIDs);

        // If we have a uniqueTransactionThreadReportID, then we are viewing an expense report with a single transaction and merging reportActions
        // In that case, we need to check if the reportActionID belongs to the transaction thread.
        if (uniqueTransactionThreadReportID) {
            const uniqueTransactionThreadReportActions = OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${uniqueTransactionThreadReportID}` as const);
            const uniqueTransactionThreadReportAction = uniqueTransactionThreadReportActions?.[reportActionID];
            if (Object.keys(uniqueTransactionThreadReportAction ?? {}).length > 0) {
                return uniqueTransactionThreadReportID;
            }
        }
    }

    // If we reach here, we couldn't find the original reportID
    return undefined;
}

export default getOriginalReportIDSync;
