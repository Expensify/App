import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getIsOffline} from '@libs/NetworkState';
import {getContinuousChain} from '@libs/PaginationUtils';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID, getSortedReportActionsForDisplay, isSentMoneyReportAction} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, isArchivedReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

type ComposerReportData = {
    report: OnyxEntry<Report>;
    filteredReportActions: ReportAction[];
    effectiveTransactionThreadReportID: string | undefined;
};

/**
 * Synchronous, event-time equivalent of the composer's report data. Reads from the Onyx cache
 * so it can be called inside event handlers without any render-bound subscriptions.
 */
function getComposerReportData(reportID: string): ComposerReportData {
    const isOffline = getIsOffline();
    const report = OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const);
    const chatReport = OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}` as const);

    const nonEmptyStringReportID = getNonEmptyStringOnyxID(report?.reportID);
    const isReportArchived = !!isArchivedReport(OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}` as const));
    const hasWriteAccess = canUserPerformWriteAction(report, isReportArchived);
    const allReportActions = OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${nonEmptyStringReportID}` as const);
    const sortedAllReportActions = getSortedReportActionsForDisplay(allReportActions, hasWriteAccess, true, undefined, nonEmptyStringReportID);
    const reportActionPages = OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${nonEmptyStringReportID}` as const);
    const unfilteredReportActions = sortedAllReportActions.length
        ? getContinuousChain(sortedAllReportActions, reportActionPages ?? [], (reportAction) => reportAction.reportActionID).data
        : [];
    const filteredReportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const allReportTransactions = OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS)?.[reportID]?.transactions ?? getEmptyObject<OnyxCollection<Transaction>>();
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, filteredReportActions, isOffline, true);
    const visibleTransactions = isOffline ? reportTransactions : reportTransactions?.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportTransactionIDs = visibleTransactions?.map((t) => t.transactionID);
    const isSentMoneyReport = filteredReportActions.some((action) => isSentMoneyReportAction(action));
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, filteredReportActions, isOffline, reportTransactionIDs);
    const effectiveTransactionThreadReportID = isSentMoneyReport ? undefined : transactionThreadReportID;

    return {report, filteredReportActions, effectiveTransactionThreadReportID};
}

export default getComposerReportData;
