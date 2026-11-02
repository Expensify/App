import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {isDeletedParentAction, isIOUActionMatchingTransactionList, isReportActionVisible} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import {reportVisibleActionsSelector} from '@selectors/ReportAction';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

type UseReportActionsVisibilityParams = {
    reportID: string | undefined;
    reportActions: ReportAction[];
    allReportActions: ReportAction[];
    canPerformWriteAction: boolean;
    loadOlderChats: (force?: boolean) => void;
    setConciergeShowFullHistory?: (show: boolean) => void;
};

type UseReportActionsVisibilityResult = {
    sortedReportActions: ReportAction[];
    sortedVisibleReportActions: ReportAction[];
    handleShowPreviousMessages: () => void;
};

function useReportActionsVisibility({
    reportID,
    reportActions,
    allReportActions,
    canPerformWriteAction,
    loadOlderChats,
    setConciergeShowFullHistory,
}: UseReportActionsVisibilityParams): UseReportActionsVisibilityResult {
    const {isOffline} = useNetwork();
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {
        selector: reportVisibleActionsSelector(reportID),
    });

    const {transactions: reportTransactions, isLoaded: areTransactionsLoaded} = useTransactionsAndViolationsForReport(reportID);
    // When transactions haven't loaded yet, pass undefined to skip IOU filtering entirely
    // (undefined = "don't filter" in isIOUActionMatchingTransactionList).
    // Once loaded, filter normally — even if transactions is empty (genuinely no transactions).
    const reportTransactionIDs = areTransactionsLoaded ? getAllNonDeletedTransactions(reportTransactions, allReportActions ?? []).map((transaction) => transaction.transactionID) : undefined;

    const visibleReportActions = reportActions.filter((reportAction) => {
        const passesOfflineCheck = isOffline || isDeletedParentAction(reportAction) || reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || reportAction.errors;

        if (!passesOfflineCheck) {
            return false;
        }

        const actionReportID = reportAction.reportID ?? reportID;
        if (!isReportActionVisible(reportAction, actionReportID, canPerformWriteAction, visibleReportActionsData)) {
            return false;
        }

        if (!isIOUActionMatchingTransactionList(reportAction, reportTransactionIDs)) {
            return false;
        }

        return true;
    });

    const showConciergeMainDMHistory = () => {
        setConciergeShowFullHistory?.(true);
        loadOlderChats(true);
    };

    return {
        sortedReportActions: reportActions,
        sortedVisibleReportActions: visibleReportActions,
        handleShowPreviousMessages: showConciergeMainDMHistory,
    };
}

export default useReportActionsVisibility;
