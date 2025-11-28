import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Report, ReportAction, ReportActions, Transaction} from '@src/types/onyx';
import {getAllNonDeletedTransactions} from './MoneyRequestReportUtils';
import {getOneTransactionThreadReportID} from './ReportActionsUtils';

type OriginalReportIDParams = {
    reportID: string | undefined;
    reportAction: OnyxInputOrEntry<Pick<ReportAction, 'reportActionID' | 'childReportID'>>;
    reportActions: OnyxEntry<ReportActions>;
    report: OnyxEntry<Report>;
    uniqueTransactionThreadReportID: string | undefined;
    uniqueTransactionThreadReportActions: OnyxEntry<ReportActions>;
};

/**
 * Returns ID of the original report from which the given reportAction is first created.
 */
function resolveOriginalReportID({
    reportID,
    reportAction,
    reportActions,
    report,
    uniqueTransactionThreadReportID,
    uniqueTransactionThreadReportActions,
}: OriginalReportIDParams): string | undefined {
    if (!reportID) {
        return undefined;
    }

    const reportActionID = reportAction?.reportActionID;
    const currentReportAction = reportActionID ? reportActions?.[reportActionID] : undefined;
    const reportActionBelongsCurrentReport = Object.keys(currentReportAction ?? {}).length > 0;
    const isThreadReportParentAction = reportAction?.childReportID?.toString() === reportID;

    if (reportActionBelongsCurrentReport) {
        return reportID;
    }

    if (isThreadReportParentAction) {
        return report?.parentReportID;
    }

    if (uniqueTransactionThreadReportID && reportActionID) {
        const uniqueTransactionThreadReportAction = uniqueTransactionThreadReportActions?.[reportActionID];
        if (Object.keys(uniqueTransactionThreadReportAction ?? {}).length > 0) {
            return uniqueTransactionThreadReportID;
        }
    }

    return undefined;
}

type UniqueTransactionThreadReportIDParams = {
    reportID: string | undefined;
    report: OnyxEntry<Report>;
    chatReport: OnyxEntry<Report>;
    reportActions: OnyxEntry<ReportActions>;
    isOffline: boolean;
    allReportTransactions: OnyxCollection<Transaction>;
};

/**
 * Computes the uniqueTransactionThreadReportID for a report.
 * This should be called once at the list level.
 */
function getUniqueTransactionThreadReportID({reportID, report, chatReport, reportActions, isOffline, allReportTransactions}: UniqueTransactionThreadReportIDParams): string | undefined {
    if (!reportID) {
        return undefined;
    }

    const visibleTransactionsIDs = getAllNonDeletedTransactions(allReportTransactions, Object.values(reportActions ?? {}))
        .filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
        .map((transaction) => transaction.transactionID);

    return getOneTransactionThreadReportID({type: report?.type}, chatReport, reportActions ?? ([] as ReportAction[]), isOffline, visibleTransactionsIDs);
}

export {resolveOriginalReportID, getUniqueTransactionThreadReportID};
