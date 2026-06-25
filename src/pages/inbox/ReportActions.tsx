import {useRoute} from '@react-navigation/native';
import React from 'react';
import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useMarkOpenReportEndOnSkeleton from '@hooks/useMarkOpenReportEndOnSkeleton';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions, shouldDisplayReportTableView, shouldWaitForTransactions as shouldWaitForTransactionsUtil} from '@libs/MoneyRequestReportUtils';
import {isConciergeChatReport, isInvoiceReport, isMoneyRequestReport} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportActionsList from './report/ReportActionsList';
import UserTypingEventListener from './report/UserTypingEventListener';
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
 * Route-only orchestrator for the report actions surface. It owns the coarse branching only —
 * skeleton vs. money-request table view vs. the chat list — and subscribes to just what those
 * branches need. All heavy data derivation lives inside the hook-driven `ReportActionsList` body,
 * which is mounted only for the chat path so its hooks/effects never run while a skeleton shows.
 */
function ReportActions() {
    const route = useRoute<ReportScreenNavigationProps['route']>();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);

    const {isOffline} = useNetwork();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [reportLoadingState = defaultReportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportIDFromRoute}`);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const {reportActions} = usePaginatedReportActions(reportIDFromRoute);

    const allReportTransactions = useReportTransactionsCollection(reportIDFromRoute);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);

    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    const shouldWaitForTransactions = shouldWaitForTransactionsUtil(report, reportTransactions, reportLoadingState, isOffline);
    const shouldDisplayMoneyRequestActionsList = isMoneyRequestOrInvoiceReport && shouldDisplayReportTableView(report, reportTransactions);

    // The app-load skeleton is hoisted out of the body so the body's data hooks/effects never run
    // during app boot. It only applies on the chat path (after the skeleton and money-request
    // branches below) — matching the previous behavior, where this skeleton lived inside the
    // chat-only ReportActionsView. Because the body won't mount for this branch, it can't close the
    // open-report span itself, so we close it here for the branch we gate.
    //
    // Concierge is excluded so the body still mounts under the app-load skeleton, seeding sessionStartTime
    // before content appeared.
    const isConciergeMainDM = isConciergeChatReport(report);
    const shouldShowAppLoadSkeleton = !!isLoadingApp && !isOffline && !!report && !shouldWaitForTransactions && !shouldDisplayMoneyRequestActionsList && !isConciergeMainDM;

    useMarkOpenReportEndOnSkeleton(report, shouldShowAppLoadSkeleton);

    if (!report || shouldWaitForTransactions) {
        return <ReportActionsSkeletonView />;
    }

    if (shouldDisplayMoneyRequestActionsList) {
        return <MoneyRequestReportActionsList />;
    }

    if (shouldShowAppLoadSkeleton) {
        return <ReportActionsSkeletonView />;
    }

    return (
        <>
            <ReportActionsList
                key={report.reportID}
                reportID={report.reportID}
            />
            <UserTypingEventListener report={report} />
        </>
    );
}

export default ReportActions;
