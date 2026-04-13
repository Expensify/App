import {useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import Animated, {FadeIn} from 'react-native-reanimated';
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

    // Defer the heavy content render by one frame so the skeleton paints first.
    // This gives the user immediate visual feedback on navigation instead of a
    // blank screen while the JS thread processes the full component tree.
    const [isDeferred, setIsDeferred] = useState(true);
    useEffect(() => {
        const raf = requestAnimationFrame(() => setIsDeferred(false));
        return () => cancelAnimationFrame(raf);
    }, []);

    if (!report || shouldWaitForTransactions || isDeferred) {
        return <ReportActionsSkeletonView />;
    }

    if (shouldDisplayMoneyRequestActionsList) {
        return (
            <Animated.View
                entering={FadeIn}
                style={{flex: 1}}
            >
                <MoneyRequestReportActionsList reportID={report.reportID} />
            </Animated.View>
        );
    }

    return (
        <Animated.View
            entering={FadeIn}
            style={{flex: 1}}
        >
            <ReportActionsView reportID={report.reportID} />
        </Animated.View>
    );
}

export default ReportActionsList;
