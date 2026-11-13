import type {ReportActionsReadinessSignals} from '@hooks/useReportActionsListModel';

import {computeReportActionsSkeletonState} from '@pages/inbox/report/ReportActionsListContext';

import type * as OnyxTypes from '@src/types/onyx';

const report: OnyxTypes.Report = {
    reportID: '1234',
    reportName: 'Test report',
    ownerAccountID: 1,
};

const unreadReport: OnyxTypes.Report = {
    ...report,
    lastReadTime: '2026-01-01 00:00:00.000',
    lastVisibleActionCreated: '2026-01-02 00:00:00.000',
    lastMessageText: 'Unread message',
    lastActorAccountID: 2,
};

const readReport: OnyxTypes.Report = {
    ...report,
    lastReadTime: '2026-01-02 00:00:00.000',
    lastVisibleActionCreated: '2026-01-01 00:00:00.000',
    lastMessageText: 'Read message',
    lastActorAccountID: 2,
};

function createReadinessSignals(overrides: Partial<ReportActionsReadinessSignals> = {}): ReportActionsReadinessSignals {
    return {
        report,
        reportResult: {status: 'loaded'},
        isOffline: false,
        reportActionIDFromRoute: undefined,
        transactionThreadReport: undefined,
        isReportArchived: false,
        isReportTransactionThread: false,
        shouldBeAlignedToTop: false,
        isReportLoadPending: false,
        isLoadingOlderReportActions: false,
        hasLoadingOlderReportActionsError: false,
        hasOnceLoadedReportActions: false,
        isLoadingInitialReportActions: false,
        isLoadingApp: false,
        reportActionsLength: 0,
        oldestReportActionID: undefined,
        hasOlderActions: false,
        hasNewerActions: false,
        oldestUnreadReportAction: undefined,
        isSingleExpenseReport: false,
        isMissingReportActions: true,
        isConciergeHiddenHistory: false,
        showConciergeSidePanelWelcome: false,
        derivedIsEmptyReport: undefined,
        hasUnreadConciergeMessageFromOthers: false,
        ...overrides,
    };
}

describe('computeReportActionsSkeletonState', () => {
    it('keeps a displayed unread action visible while its report refreshes', () => {
        // Given a cached unread action has already been displayed before reconnecting.
        const signals = createReadinessSignals({
            report: unreadReport,
            hasOnceLoadedReportActions: true,
            reportActionsLength: 1,
            isMissingReportActions: false,
            isReportLoadPending: true,
            isLoadingInitialReportActions: true,
        });

        // When OpenReport refreshes that report after reconnecting, while the guard is already showing the list.
        const state = computeReportActionsSkeletonState(signals, true);

        // Then the existing list keeps its viewport instead of remounting behind a skeleton.
        expect(state.shouldShowLoadingSkeleton).toBe(false);
    });

    it('keeps a new mount of an unread report gated while OpenReport is pending, even after an earlier load', () => {
        // Given the report loaded earlier in this session, but only its newest action is cached now and it has unread messages.
        const signals = createReadinessSignals({
            report: unreadReport,
            hasOnceLoadedReportActions: true,
            reportActionsLength: 1,
            isMissingReportActions: false,
            isReportLoadPending: true,
            isLoadingInitialReportActions: true,
        });

        // When the report is opened again online and its list has not been displayed by this mount yet.
        const state = computeReportActionsSkeletonState(signals, false);

        // Then the skeleton waits for OpenReport so the list can mount at the first unread message instead of the newest one.
        expect(state.shouldShowLoadingSkeleton).toBe(true);
    });

    it('shows the app-load skeleton on a new mount but not once the list has been displayed', () => {
        // Given an app load is pending online for a report that loaded earlier in this session.
        const signals = createReadinessSignals({
            report: readReport,
            hasOnceLoadedReportActions: true,
            reportActionsLength: 2,
            isMissingReportActions: false,
            isLoadingApp: true,
        });

        // When the guard has not shown the list yet, and when it already shows it (an app load resuming on reconnect).
        const newMountState = computeReportActionsSkeletonState(signals, false);
        const displayedState = computeReportActionsSkeletonState(signals, true);

        // Then only the new mount waits, so a list on screen is never replaced and keeps its scroll position.
        expect(newMountState.shouldShowLoadingSkeleton).toBe(true);
        expect(displayedState.shouldShowLoadingSkeleton).toBe(false);
    });

    it('shows the loading skeleton for a pending OpenReport matching this report', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                isReportLoadPending: true,
            }),
        );

        expect(state.shouldShowLoadingSkeleton).toBe(true);
    });

    it('does not show the loading skeleton when no OpenReport matching this report is pending', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                isReportLoadPending: false,
            }),
        );

        expect(state.shouldShowLoadingSkeleton).toBe(false);
    });

    it('does not show the loading skeleton for a pending OpenReport while offline', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                isOffline: true,
                isReportLoadPending: true,
            }),
        );

        expect(state.shouldShowLoadingSkeleton).toBe(false);
    });

    it('releases the loading skeleton after a terminal OpenReport failure', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                isReportLoadPending: false,
            }),
        );

        expect(state.shouldShowLoadingSkeleton).toBe(false);
    });

    it('releases the unread initial load when no report load is pending', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                report: unreadReport,
                isMissingReportActions: false,
                reportActionsLength: 1,
                isReportLoadPending: false,
                isLoadingInitialReportActions: false,
            }),
        );

        expect(state.shouldShowLoadingSkeleton).toBe(false);
    });

    it('preserves the unread initial load before OpenReport enters the queue', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                report: unreadReport,
                isMissingReportActions: false,
                reportActionsLength: 1,
                isReportLoadPending: false,
                isLoadingInitialReportActions: undefined,
            }),
        );

        expect(state.shouldShowLoadingSkeleton).toBe(true);
    });

    it('preserves a top-aligned unread initial load before OpenReport enters the queue', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                report: unreadReport,
                isMissingReportActions: false,
                reportActionsLength: 1,
                shouldBeAlignedToTop: true,
                isReportLoadPending: false,
                isLoadingInitialReportActions: undefined,
            }),
        );

        expect(state.shouldShowLoadingSkeleton).toBe(true);
    });

    it('releases a top-aligned unread initial load after a terminal OpenReport failure', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                report: unreadReport,
                isMissingReportActions: false,
                reportActionsLength: 1,
                shouldBeAlignedToTop: true,
                isReportLoadPending: false,
                isLoadingInitialReportActions: false,
            }),
        );

        expect(state.shouldShowLoadingSkeleton).toBe(false);
    });

    it('keeps a partially cached unread report gated while its OpenReport is pending', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                report: unreadReport,
                isMissingReportActions: false,
                reportActionsLength: 2,
                isReportLoadPending: true,
                isLoadingInitialReportActions: false,
            }),
        );

        expect(state.shouldShowLoadingSkeleton).toBe(true);
    });

    it('preserves the unread initial load when the report load is pending', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                report: unreadReport,
                isMissingReportActions: false,
                reportActionsLength: 1,
                shouldBeAlignedToTop: true,
                isReportLoadPending: true,
            }),
        );

        expect(state.shouldShowLoadingSkeleton).toBe(true);
    });

    it('releases the linked message skeleton when no report load is pending', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                report: readReport,
                reportActionIDFromRoute: '5678',
                isMissingReportActions: false,
                reportActionsLength: 2,
                isReportLoadPending: false,
            }),
        );

        expect(state.shouldShowLoadingSkeleton).toBe(false);
    });

    it('preserves the linked message skeleton when the report load is pending', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                report: readReport,
                reportActionIDFromRoute: '5678',
                isMissingReportActions: false,
                reportActionsLength: 2,
                isReportLoadPending: true,
            }),
        );

        expect(state.shouldShowLoadingSkeleton).toBe(true);
    });
});
