import {useMemo} from 'react';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxInputOrEntry, ReportAction} from '@src/types/onyx';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

function useOriginalReportID(reportID: string | undefined, reportAction: OnyxInputOrEntry<ReportAction>): string | undefined {
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canBeMissing: true});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`, {canBeMissing: true});
    const {isOffline} = useNetwork();
    const {transactions: allReportTransactions} = useTransactionsAndViolationsForReport(reportID);

    const visibleTransactionsIDs = useMemo(
        () =>
            getAllNonDeletedTransactions(allReportTransactions, Object.values(reportActions ?? {}))
                .filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
                .map((transaction) => transaction.transactionID),
        [allReportTransactions, reportActions, isOffline],
    );
    if (!reportID) {
        return undefined;
    }
    const currentReportAction = reportAction?.reportActionID ? reportActions?.[reportAction.reportActionID] : undefined;

    if (Object.keys(currentReportAction ?? {}).length === 0) {
        const isThreadReportParentAction = reportAction?.childReportID?.toString() === reportID;
        if (isThreadReportParentAction) {
            return report?.parentReportID;
        }
        const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? ([] as ReportAction[]), isOffline, visibleTransactionsIDs);
        return transactionThreadReportID ?? reportID;
    }
    return reportID;
}

export default useOriginalReportID;
