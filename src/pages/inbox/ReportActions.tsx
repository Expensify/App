import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import NavigationDeferredMount from '@components/NavigationDeferredMount';

import {useIsAppLoadPending, useIsReportLoadPending} from '@hooks/useInFlightRequests';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions, shouldDisplayReportTableView, shouldWaitForTransactions as shouldWaitForTransactionsUtil} from '@libs/MoneyRequestReportUtils';
import {isConciergeChatReport, isInvoiceReport, isMoneyRequestReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import {useRoute} from '@react-navigation/native';
import React from 'react';

import type ReportScreenNavigationProps from './types';

import ReportActionsList from './report/ReportActionsList';
import ReportActionsLoadingSkeleton from './report/ReportActionsLoadingSkeleton';
import UserTypingEventListener from './report/UserTypingEventListener';

const defaultReportLoadingState = {
    hasOnceLoadedReportActions: false,
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
};

type ReportActionsViewProps = {
    report: Report;
};

/** Keep chat effects unmounted during app loading, except for the Concierge welcome screen. */
function ChatReportActions({report}: ReportActionsViewProps) {
    const {isOffline} = useNetwork();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isAppLoadPending = useIsAppLoadPending();
    const isConciergeMainDM = isConciergeChatReport(report, conciergeReportID);

    if (isAppLoadPending && !isOffline && !isConciergeMainDM) {
        return (
            <ReportActionsLoadingSkeleton
                reportID={report.reportID}
                skeletonName={CONST.TELEMETRY.CANCELED_BY_SKELETON.REPORT_ACTIONS_APP_LOAD}
            />
        );
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

/** Only money-request and invoice reports need transactions to select their actions layout. */
function MoneyRequestReportActions({report}: ReportActionsViewProps) {
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

/** Choose the report surface without mounting transaction-based layout selection for ordinary chats. */
function ReportActions() {
    const route = useRoute<ReportScreenNavigationProps['route']>();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);

    if (!report) {
        return (
            <ReportActionsLoadingSkeleton
                reportID={reportIDFromRoute}
                skeletonName={CONST.TELEMETRY.CANCELED_BY_SKELETON.REPORT_ACTIONS_REPORT_DATA_LOADING}
            />
        );
    }

    if (isMoneyRequestReport(report) || isInvoiceReport(report)) {
        return <MoneyRequestReportActions report={report} />;
    }

    return <ChatReportActions report={report} />;
}

type ReportActionsWithInboxTabDeferredMountProps = {
    /** The report ID used by the deferred loading skeleton */
    reportID: string | undefined;

    /** Whether to defer mounting report actions during the initial Inbox tab navigation */
    shouldDefer: boolean;
};

function ReportActionsWithInboxTabDeferredMount({reportID, shouldDefer}: ReportActionsWithInboxTabDeferredMountProps) {
    if (!shouldDefer) {
        return <ReportActions />;
    }

    return (
        <NavigationDeferredMount
            waitForUpcomingTransition={false}
            placeholder={
                // Deferral, not a data wait. Closing the span here would time the defer and tag a cached report cold.
                <ReportActionsLoadingSkeleton
                    reportID={reportID}
                    skeletonName={CONST.TELEMETRY.CANCELED_BY_SKELETON.INBOX_TAB_DEFER}
                    shouldMarkOpenReportEnd={false}
                />
            }
        >
            <ReportActions />
        </NavigationDeferredMount>
    );
}

export {ReportActionsWithInboxTabDeferredMount};
export default ReportActions;
