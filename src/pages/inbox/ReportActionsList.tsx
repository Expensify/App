import {useRoute} from '@react-navigation/native';
import React from 'react';
import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {shouldDisplayReportTableView, shouldWaitForTransactions as shouldWaitForTransactionsUtil} from '@libs/MoneyRequestReportUtils';
import {isInvoiceReport, isMoneyRequestReport} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
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
 * Lightweight orchestrator that decides between skeleton, ReportActionsView,
 * or MoneyRequestReportActionsList. Only subscribes to what the branching
 * conditions need — heavy data derivation is pushed into each child.
 */
function ReportActionsList() {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);

    const {isOffline} = useNetwork();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);

    // Raw transaction collection — cheap Onyx derived selector, only used for branching (length / reportID checks)
    const allReportTransactions = useReportTransactionsCollection(reportIDFromRoute);
    const rawTransactions = Object.values(allReportTransactions ?? {}).filter((t): t is Transaction => !!t);

    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    const shouldWaitForTransactions = shouldWaitForTransactionsUtil(report, rawTransactions, reportMetadata, isOffline);
    const shouldDisplayMoneyRequestActionsList = isMoneyRequestOrInvoiceReport && shouldDisplayReportTableView(report, rawTransactions);

    if (!report || shouldWaitForTransactions) {
        return <ReportActionsSkeletonView />;
    }

    if (shouldDisplayMoneyRequestActionsList) {
        return <MoneyRequestReportActionsList reportID={report.reportID} />;
    }

    return <ReportActionsView reportID={report.reportID} />;
}

export default ReportActionsList;
