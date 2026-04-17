import {useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions, shouldDisplayReportTableView, shouldWaitForTransactions as shouldWaitForTransactionsUtil} from '@libs/MoneyRequestReportUtils';
import {isInvoiceReport, isMoneyRequestReport} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportActionsView from './report/ReportActionsView';

const BLANK_SCREEN_DURATION_MS = 300;

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
    const {reportActions} = usePaginatedReportActions(reportIDFromRoute);

    const allReportTransactions = useReportTransactionsCollection(reportIDFromRoute);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);

    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    const shouldWaitForTransactions = shouldWaitForTransactionsUtil(report, reportTransactions, reportMetadata, isOffline);
    const shouldDisplayMoneyRequestActionsList = isMoneyRequestOrInvoiceReport && shouldDisplayReportTableView(report, reportTransactions);

    // For money request / invoice reports, shouldFocusToTopOnMount = true inside the inner
    // ReportActionsList forces initialNumToRender = all items, making the render potentially
    // very slow (~5s for large reports). We must commit a skeleton BEFORE that render begins.
    //
    // For all other report types (fast renders, typically <50ms), committing a skeleton first
    // causes a visible flash. Instead we go blank → content directly.
    //
    // Transition sequence:
    //   slow reports: blank (300ms) → skeleton (1 frame) → heavy render → content
    //   fast reports: blank (300ms) → content
    const [renderPhase, setRenderPhase] = useState<'blank' | 'skeleton' | 'content'>('blank');
    useEffect(() => {
        const timer = setTimeout(() => {
            setRenderPhase(isMoneyRequestOrInvoiceReport ? 'skeleton' : 'content');
        }, BLANK_SCREEN_DURATION_MS);
        return () => clearTimeout(timer);
        // isMoneyRequestOrInvoiceReport is intentionally read at mount time only — report type
        // does not change mid-navigation and capturing it once avoids restarting the timer.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (renderPhase !== 'skeleton') {
            return;
        }
        const raf = requestAnimationFrame(() => setRenderPhase('content'));
        return () => cancelAnimationFrame(raf);
    }, [renderPhase]);

    if (renderPhase === 'blank') {
        return null;
    }
    if (renderPhase !== 'content' || !report || shouldWaitForTransactions) {
        return <ReportActionsSkeletonView />;
    }

    if (shouldDisplayMoneyRequestActionsList) {
        return <MoneyRequestReportActionsList />;
    }

    return <ReportActionsView reportID={reportIDFromRoute} />;
}

export default ReportActionsList;
