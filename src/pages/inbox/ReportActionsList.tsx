import {useRoute} from '@react-navigation/native';
import React from 'react';
import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useNetwork from '@hooks/useNetwork';
import useNewTransactions from '@hooks/useNewTransactions';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions, shouldDisplayReportTableView, shouldWaitForTransactions as shouldWaitForTransactionsUtil} from '@libs/MoneyRequestReportUtils';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import {getReportOfflinePendingActionAndErrors, isInvoiceReport, isMoneyRequestReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportActionsView from './report/ReportActionsView';

const defaultReportMetadata = {
    hasOnceLoadedReportActions: false,
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
    isOptimisticReport: false,
};

/**
 * Self-subscribing building block that owns the message list area:
 * - Decides between skeleton | ReportActionsView | MoneyRequestReportActionsList
 * - Subscribes to reportActions, transactions, metadata internally
 */
function ReportActionsList() {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string; reportActionID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);
    const reportActionIDFromRoute = routeParams?.reportActionID;

    const {isOffline} = useNetwork();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);

    const reportID = report?.reportID;

    const {reportActions: unfilteredReportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID, reportActionIDFromRoute);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const allReportTransactions = useReportTransactionsCollection(reportIDFromRoute);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactions = reportTransactions?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportTransactionIDs = visibleTransactions?.map((transaction) => transaction.transactionID);
    const hasPendingDeletionTransaction = Object.values(allReportTransactions ?? {}).some((transaction) => transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const newTransactions = useNewTransactions(reportMetadata?.hasOnceLoadedReportActions, reportTransactions);

    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    const shouldWaitForTransactions = shouldWaitForTransactionsUtil(report, reportTransactions, reportMetadata, isOffline);
    const shouldDisplayMoneyRequestActionsList = isMoneyRequestOrInvoiceReport && shouldDisplayReportTableView(report, visibleTransactions ?? []);

    const showReportActionsLoadingState = reportMetadata?.isLoadingInitialReportActions && !reportMetadata?.hasOnceLoadedReportActions;
    const {reportPendingAction} = getReportOfflinePendingActionAndErrors(report);

    if (!report || shouldWaitForTransactions) {
        return <ReportActionsSkeletonView />;
    }

    if (shouldDisplayMoneyRequestActionsList) {
        return (
            <MoneyRequestReportActionsList
                report={report}
                hasPendingDeletionTransaction={hasPendingDeletionTransaction}
                policy={policy}
                reportActions={reportActions}
                transactions={visibleTransactions}
                newTransactions={newTransactions}
                hasOlderActions={hasOlderActions}
                hasNewerActions={hasNewerActions}
                showReportActionsLoadingState={showReportActionsLoadingState}
                reportPendingAction={reportPendingAction}
            />
        );
    }

    return (
        <ReportActionsView
            report={report}
            reportActions={reportActions}
            isLoadingInitialReportActions={reportMetadata?.isLoadingInitialReportActions}
            hasOnceLoadedReportActions={reportMetadata?.hasOnceLoadedReportActions}
            hasNewerActions={hasNewerActions}
            hasOlderActions={hasOlderActions}
            transactionThreadReportID={transactionThreadReportID}
        />
    );
}

export default ReportActionsList;
