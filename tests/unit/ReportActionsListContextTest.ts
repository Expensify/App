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
        hasReportActionPages: true,
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

        // When OpenReport refreshes that report after reconnecting.
        const state = computeReportActionsSkeletonState(signals);

        // Then the existing list keeps its viewport instead of remounting behind a skeleton.
        expect(state.shouldShowLoadingSkeleton).toBe(false);
    });

    it('shows the loading skeleton while OpenReport is pending for actions without a loaded page', () => {
        // Given a read chat whose only cached actions came without a page, e.g. from OpenApp after a cache clear
        const signals = createReadinessSignals({
            report: readReport,
            isMissingReportActions: false,
            reportActionsLength: 3,
            hasReportActionPages: false,
            isReportLoadPending: true,
        });

        // When the skeleton state is computed while its OpenReport is pending
        const state = computeReportActionsSkeletonState(signals);

        // Then the skeleton shows, so the list never opens at scattered older messages that jump away on load
        expect(state.shouldShowLoadingSkeleton).toBe(true);
    });

    it('shows the loading skeleton for actions without a loaded page before OpenReport is queued', () => {
        // Given a read chat with unpaged cached actions whose screen has not queued OpenReport yet
        const signals = createReadinessSignals({
            report: readReport,
            isMissingReportActions: false,
            reportActionsLength: 3,
            hasReportActionPages: false,
            isReportLoadPending: false,
            isLoadingInitialReportActions: undefined,
        });

        // When the skeleton state is computed on that first render
        const state = computeReportActionsSkeletonState(signals);

        // Then the skeleton already shows, so the list does not mount, mark the chat as read and remount without its unread marker
        expect(state.shouldShowLoadingSkeleton).toBe(true);
    });

    it('shows cached actions without a loaded page for an optimistic report', () => {
        // Given an optimistic chat that only has local actions and no page yet
        const signals = createReadinessSignals({
            report: {...readReport, pendingFields: {createReport: 'add'}},
            isMissingReportActions: false,
            reportActionsLength: 1,
            hasReportActionPages: false,
            isReportLoadPending: true,
        });

        // When the skeleton state is computed while its OpenReport is pending
        const state = computeReportActionsSkeletonState(signals);

        // Then the local actions stay visible because they are all there is to show
        expect(state.shouldShowLoadingSkeleton).toBe(false);
    });

    it('shows cached actions with a loaded page while OpenReport is pending', () => {
        // Given a read chat with a page of cached actions from an earlier visit
        const signals = createReadinessSignals({
            report: readReport,
            isMissingReportActions: false,
            reportActionsLength: 3,
            isReportLoadPending: true,
        });

        // When the skeleton state is computed while its OpenReport refreshes the chat
        const state = computeReportActionsSkeletonState(signals);

        // Then the cached page shows right away
        expect(state.shouldShowLoadingSkeleton).toBe(false);
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
