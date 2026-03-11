import {useRoute} from '@react-navigation/native';
import React from 'react';
import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useAgentZeroStatusIndicator from '@hooks/useAgentZeroStatusIndicator';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useNetwork from '@hooks/useNetwork';
import useNewTransactions from '@hooks/useNewTransactions';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useSidePanelState from '@hooks/useSidePanelState';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions, shouldDisplayReportTableView, shouldWaitForTransactions as shouldWaitForTransactionsUtil} from '@libs/MoneyRequestReportUtils';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID, isCreatedAction} from '@libs/ReportActionsUtils';
import {getReportOfflinePendingActionAndErrors, isConciergeChatReport, isInvoiceReport, isMoneyRequestReport, isReportTransactionThread} from '@libs/ReportUtils';
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

    const isInSidePanel = useIsInSidePanel();
    const {isOffline} = useNetwork();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const parentReportAction = useParentReportAction(report);
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

    const isTransactionThreadView = isReportTransactionThread(report);
    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    const shouldWaitForTransactions = shouldWaitForTransactionsUtil(report, reportTransactions, reportMetadata, isOffline);
    const shouldDisplayMoneyRequestActionsList = isMoneyRequestOrInvoiceReport && shouldDisplayReportTableView(report, visibleTransactions ?? []);

    const showReportActionsLoadingState = reportMetadata?.isLoadingInitialReportActions && !reportMetadata?.hasOnceLoadedReportActions;
    const {reportPendingAction} = getReportOfflinePendingActionAndErrors(report);

    const isConciergeChat = isConciergeChatReport(report);
    const isConciergeSidePanel = isInSidePanel && isConciergeChatReport(report, conciergeReportID);
    const {sessionStartTime} = useSidePanelState();
    const hasUserSentMessage = (() => {
        if (!isConciergeSidePanel || !sessionStartTime) {
            return false;
        }
        return reportActions.some((action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created >= sessionStartTime);
    })();

    const {
        isProcessing: isConciergeProcessing,
        reasoningHistory: conciergeReasoningHistory,
        statusLabel: conciergeStatusLabel,
    } = useAgentZeroStatusIndicator(String(report?.reportID ?? CONST.DEFAULT_NUMBER_ID), isConciergeChat);

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
            parentReportAction={parentReportAction}
            transactionThreadReportID={transactionThreadReportID}
            isReportTransactionThread={isTransactionThreadView}
            isConciergeSidePanel={isConciergeSidePanel}
            hasUserSentMessage={hasUserSentMessage}
            sessionStartTime={sessionStartTime}
            isConciergeProcessing={isConciergeProcessing}
            conciergeReasoningHistory={conciergeReasoningHistory}
            conciergeStatusLabel={conciergeStatusLabel}
        />
    );
}

export default ReportActionsList;
