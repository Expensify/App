/** Only money-request and invoice reports need transactions to select their actions layout. */
import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';

import {useIsReportLoadPending} from '@hooks/useInFlightRequests';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';

import {getAllNonDeletedTransactions, shouldDisplayReportTableView, shouldWaitForTransactions as shouldWaitForTransactionsUtil} from '@libs/MoneyRequestReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';

import ChatReportActions from './ChatReportActions';
import ReportActionsLoadingSkeleton from './report/ReportActionsLoadingSkeleton';

const defaultReportLoadingState = {
    hasOnceLoadedReportActions: false,
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
};

type MoneyRequestReportActionsProps = {
    report: Report;
};

function MoneyRequestReportActions({report}: MoneyRequestReportActionsProps) {
    const {isOffline} = useNetwork();
    const [reportLoadingState = defaultReportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${report.reportID}`);
    const isReportLoadPending = useIsReportLoadPending(report.reportID);
    const {reportActions} = usePaginatedReportActions(report.reportID);
    const allReportTransactions = useReportTransactionsCollection(report.reportID);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const shouldWaitForTransactions = shouldWaitForTransactionsUtil(report, reportTransactions, reportLoadingState, isReportLoadPending, isOffline);

    if (shouldWaitForTransactions) {
        return (
            <ReportActionsLoadingSkeleton
                reportID={report.reportID}
                skeletonName={CONST.TELEMETRY.CANCELED_BY_SKELETON.REPORT_ACTIONS_REPORT_DATA_LOADING}
            />
        );
    }

    if (shouldDisplayReportTableView(report, reportTransactions)) {
        return <MoneyRequestReportActionsList />;
    }

    return <ChatReportActions report={report} />;
}

export default MoneyRequestReportActions;
