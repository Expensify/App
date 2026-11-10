/** Loading uses the selected conversation before display-only payment and survey exclusions. */
import {isUnread} from '@libs/ReportUtils';

import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type ReportActionsReadinessSignals = {
    report: OnyxEntry<Report>;
    isOffline: boolean;
    reportActionIDFromRoute: string | undefined;
    transactionThreadReport: OnyxEntry<Report>;
    isReportArchived: boolean;
    isReportTransactionThread: boolean;
    shouldBeAlignedToTop: boolean;
    isReportLoadPending: boolean;
    isLoadingOlderReportActions: boolean | undefined;
    hasLoadingOlderReportActionsError: boolean | undefined;
    hasOnceLoadedReportActions: boolean | undefined;
    isLoadingInitialReportActions: boolean | undefined;
    isLoadingApp: boolean;
    reportActionsLength: number;
    oldestReportActionID: string | undefined;
    hasOlderActions: boolean;
    hasNewerActions: boolean;
    oldestUnreadReportAction: OnyxEntry<ReportAction>;
    isSingleExpenseReport: boolean;
    isMissingReportActions: boolean;
    isConciergeHiddenHistory: boolean;
    showConciergeSidePanelWelcome: boolean;
    derivedIsEmptyReport: boolean | undefined;
    hasUnreadConciergeMessageFromOthers: boolean;
};

function getReportActionsLoadingState({
    report,
    isOffline,
    reportActionIDFromRoute,
    transactionThreadReport,
    isReportArchived,
    isReportTransactionThread,
    shouldBeAlignedToTop,
    isReportLoadPending,
    hasOnceLoadedReportActions,
    isLoadingInitialReportActions,
    isLoadingApp,
    reportActionsLength,
    oldestUnreadReportAction,
    isSingleExpenseReport,
    isMissingReportActions,
    isConciergeHiddenHistory,
    showConciergeSidePanelWelcome,
    derivedIsEmptyReport,
}: ReportActionsReadinessSignals) {
    const isReportUnread = isUnread(report, transactionThreadReport, isReportArchived, derivedIsEmptyReport);
    // A missing initial flag is not a completed OpenReport; terminal failures explicitly clear it.
    const shouldKeepInitialReportLoadGated = isReportLoadPending || (!hasOnceLoadedReportActions && isLoadingInitialReportActions !== false);
    const isInitiallyLoadingReport = isReportUnread && shouldKeepInitialReportLoadGated && reportActionsLength <= 1;
    const isUnreadMessagePageLoadingInitially =
        !shouldBeAlignedToTop && !reportActionIDFromRoute && isReportUnread && !oldestUnreadReportAction && !hasOnceLoadedReportActions && shouldKeepInitialReportLoadGated;
    const isReportReady = isOffline || (!isInitiallyLoadingReport && !isUnreadMessagePageLoadingInitially);
    const isReportDataIncomplete = isSingleExpenseReport && !transactionThreadReport?.reportID;
    const shouldShowInitialSkeleton =
        !isOffline &&
        ((isReportLoadPending && (isReportDataIncomplete || isMissingReportActions)) ||
            isLoadingApp ||
            (isConciergeHiddenHistory && !hasOnceLoadedReportActions) ||
            (!!reportActionIDFromRoute && !hasOnceLoadedReportActions && isReportLoadPending));

    return {
        shouldShowLoadingSkeleton: !report || !isReportReady || shouldShowInitialSkeleton,
        shouldShowDerivedTimingSkeleton: ((reportActionsLength > 0 && isMissingReportActions) || (!isReportTransactionThread && isMissingReportActions)) && !showConciergeSidePanelWelcome,
    };
}

export default getReportActionsLoadingState;
export type {ReportActionsReadinessSignals};
