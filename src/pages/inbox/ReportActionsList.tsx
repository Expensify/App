import {useRoute} from '@react-navigation/native';
import React from 'react';
import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useLatchedTransactionIDs from '@hooks/useLatchedTransactionIDs';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions, shouldDisplayReportTableView, shouldWaitForTransactions as shouldWaitForTransactionsUtil} from '@libs/MoneyRequestReportUtils';
import {isInvoiceReport, isMoneyRequestReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportActionsView from './report/ReportActionsView';
import type ReportScreenNavigationProps from './types';

const defaultReportLoadingState = {
    hasOnceLoadedReportActions: false,
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
};

/**
 * Lightweight orchestrator that decides between skeleton, ReportActionsView,
 * or MoneyRequestReportActionsList. Only subscribes to what the branching
 * conditions need — heavy data derivation is pushed into each child.
 */
function ReportActionsList() {
    const route = useRoute<ReportScreenNavigationProps['route']>();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);

    const {isOffline} = useNetwork();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [reportLoadingState = defaultReportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportIDFromRoute}`);
    const {reportActions} = usePaginatedReportActions(reportIDFromRoute);

    const allReportTransactions = useReportTransactionsCollection(reportIDFromRoute);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactions = reportTransactions.filter((t) => isOffline || t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    const latchedIDs = useLatchedTransactionIDs(visibleTransactions, reportIDFromRoute);
    const transactionsForViewDecision = latchedIDs ? visibleTransactions.filter((t) => latchedIDs.has(t.transactionID)) : visibleTransactions;

    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    const shouldWaitForTransactions = shouldWaitForTransactionsUtil(report, reportTransactions, reportLoadingState, isOffline);
    const shouldDisplayMoneyRequestActionsList = isMoneyRequestOrInvoiceReport && shouldDisplayReportTableView(report, transactionsForViewDecision);

    if (!report || shouldWaitForTransactions) {
        return <ReportActionsSkeletonView />;
    }

    if (shouldDisplayMoneyRequestActionsList) {
        return <MoneyRequestReportActionsList />;
    }

    return <ReportActionsView reportID={reportIDFromRoute} />;
}

export default ReportActionsList;
