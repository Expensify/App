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
        hasOnceLoadedReportActions: false,
        isLoadingApp: false,
        reportActionsLength: 0,
        oldestUnreadReportAction: undefined,
        isSingleExpenseReport: false,
        isMissingReportActions: true,
        isConciergeHiddenHistory: false,
        isConciergeMainDM: false,
        hasCachedReportActions: false,
        showConciergeSidePanelWelcome: false,
        ...overrides,
    };
}

describe('computeReportActionsSkeletonState', () => {
    it('shows the initial skeleton for a pending OpenReport matching this report', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                isReportLoadPending: true,
            }),
        );

        expect(state.shouldShowInitialSkeleton).toBe(true);
    });

    it('does not show the initial skeleton when no OpenReport matching this report is pending', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                isReportLoadPending: false,
            }),
        );

        expect(state.shouldShowInitialSkeleton).toBe(false);
    });

    it('does not show the initial skeleton for a pending OpenReport while offline', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                isOffline: true,
                isReportLoadPending: true,
            }),
        );

        expect(state.shouldShowInitialSkeleton).toBe(false);
    });

    it('releases the initial skeleton after a terminal OpenReport failure', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                isReportLoadPending: false,
            }),
        );

        expect(state.shouldShowInitialSkeleton).toBe(false);
    });

    it('releases the unread initial load when no report load is pending', () => {
        const state = computeReportActionsSkeletonState(
            createReadinessSignals({
                report: unreadReport,
                isMissingReportActions: false,
                reportActionsLength: 1,
                isReportLoadPending: false,
            }),
        );

        expect(state.shouldShowLoadingSkeleton).toBe(false);
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

        expect(state.shouldShowInitialSkeleton).toBe(false);
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

        expect(state.shouldShowInitialSkeleton).toBe(true);
    });
});
