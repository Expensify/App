import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import NavigationDeferredMount from '@components/NavigationDeferredMount';

import useMarkOpenReportEndOnSkeleton from '@hooks/useMarkOpenReportEndOnSkeleton';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions, shouldDisplayReportTableView, shouldWaitForTransactions as shouldWaitForTransactionsUtil} from '@libs/MoneyRequestReportUtils';
import {isConciergeChatReport, isInvoiceReport, isMoneyRequestReport} from '@libs/ReportUtils';
import {getSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ReactNode} from 'react';

import {useRoute} from '@react-navigation/native';
import React, {useState} from 'react';

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

/**
 * On wide layout, tapping the Inbox tab co-mounts this report screen with the LHN sidebar in a single commit,
 * so the ManualNavigateToInboxTab span (which ends at the sidebar layout) is gated on the heavy report list
 * rendering in that same commit. When `enabled`, this defers the list one frame behind a skeleton so the first
 * commit stays cheap and the sidebar can paint without waiting for the list.
 *
 * Enabled only for that co-mount (see `shouldDeferForInboxTab`), so ordinary report opens render immediately.
 * Trade-off: the report content paints one frame later, so ManualOpenReport reflects that later paint.
 */
function DeferReportListForInboxTab({enabled, reportID, children}: {enabled: boolean; reportID: string | undefined; children: ReactNode}) {
    if (!enabled) {
        return children;
    }
    return (
        <NavigationDeferredMount
            waitForUpcomingTransition={false}
            placeholder={
                <ReportActionsLoadingSkeleton
                    reportID={reportID}
                    skeletonName={CONST.TELEMETRY.CANCELED_BY_SKELETON.INBOX_TAB_DEFER}
                />
            }
        >
            {children}
        </NavigationDeferredMount>
    );
}

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
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
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
    const isConciergeMainDM = isConciergeChatReport(report, conciergeReportID);
    const shouldShowAppLoadSkeleton = !!isLoadingApp && !isOffline && !!report && !shouldWaitForTransactions && !shouldDisplayMoneyRequestActionsList && !isConciergeMainDM;

    useMarkOpenReportEndOnSkeleton(report, shouldShowAppLoadSkeleton);

    // The Inbox tab button starts SPAN_NAVIGATE_TO_INBOX_TAB synchronously before navigating, so on a
    // wide-layout tab tap it is in flight when this screen mounts as the co-mounted central pane. Captured
    // once at mount (lazy state initializer) so we defer the heavy list only for that case, not for ordinary
    // report opens.
    const [shouldDeferForInboxTab] = useState(() => !!getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB));

    if (!report || shouldWaitForTransactions) {
        return (
            <ReportActionsLoadingSkeleton
                reportID={reportIDFromRoute}
                skeletonName={CONST.TELEMETRY.CANCELED_BY_SKELETON.REPORT_ACTIONS_REPORT_DATA_LOADING}
            />
        );
    }

    if (shouldDisplayMoneyRequestActionsList) {
        return (
            <DeferReportListForInboxTab
                enabled={shouldDeferForInboxTab}
                reportID={reportIDFromRoute}
            >
                <MoneyRequestReportActionsList />
            </DeferReportListForInboxTab>
        );
    }

    if (shouldShowAppLoadSkeleton) {
        return (
            <ReportActionsLoadingSkeleton
                reportID={reportIDFromRoute}
                skeletonName={CONST.TELEMETRY.CANCELED_BY_SKELETON.REPORT_ACTIONS_APP_LOAD}
            />
        );
    }

    return (
        <DeferReportListForInboxTab
            enabled={shouldDeferForInboxTab}
            reportID={reportIDFromRoute}
        >
            <ReportActionsList
                key={report.reportID}
                reportID={report.reportID}
            />
            <UserTypingEventListener report={report} />
        </DeferReportListForInboxTab>
    );
}

export default ReportActions;
