import {createContext, useContext} from 'react';
import type {ReportActionsListActions, ReportActionsListState, ReportActionsReadinessSignals} from '@hooks/useReportActionsListModel';
import {isUnread} from '@libs/ReportUtils';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

/**
 * Carries the render `state` slice from the guard to `ReportActionsList` so the list renders from the same
 * derivations as the skeleton decision without re-subscribing.
 */
const ReportActionsListStateContext = createContext<ReportActionsListState | null>(null);

/**
 * Carries the command handles (load older/newer, show previous messages). Kept on a separate context from
 * the state slice because the handles are referentially stable, so actions-only consumers don't re-render
 * when the state slice churns.
 */
const ReportActionsListActionsContext = createContext<ReportActionsListActions | null>(null);

/** Read the report-actions render state. Throws if used outside the guard's provider. */
function useReportActionsListState(): ReportActionsListState {
    const value = useContext(ReportActionsListStateContext);
    if (value === null) {
        throw new Error('useReportActionsListState must be used within a ReportActionsListStateContext.Provider');
    }
    return value;
}

/** Read the report-actions command handles. Throws if used outside the guard's provider. */
function useReportActionsListActions(): ReportActionsListActions {
    const value = useContext(ReportActionsListActionsContext);
    if (value === null) {
        throw new Error('useReportActionsListActions must be used within a ReportActionsListActionsContext.Provider');
    }
    return value;
}

/**
 * Pure derivation of the two skeleton states from the readiness signals: a loading skeleton and the
 * derived-value-timing skeleton. The guard uses these to decide whether to render the list.
 */
function computeReportActionsSkeletonState(readinessSignals: ReportActionsReadinessSignals) {
    const {
        report,
        reportResult,
        isOffline,
        reportActionIDFromRoute,
        transactionThreadReport,
        isReportArchived,
        isReportTransactionThread,
        isLoadingInitialReportActions,
        hasOnceLoadedReportActions,
        isLoadingApp,
        reportActionsLength,
        oldestUnreadReportAction,
        isSingleExpenseReport,
        isMissingReportActions,
        isConciergeHiddenHistory,
        isConciergeMainDM,
        hasCachedReportActions,
        showConciergeSidePanelWelcome,
    } = readinessSignals;

    const isReportUnread = isUnread(report, transactionThreadReport, isReportArchived);

    // When opening an unread report, it is very likely that the message we will open to is not the latest,
    // which is the only one we will have in cache.
    const isInitiallyLoadingReport = isReportUnread && !!isLoadingInitialReportActions && reportActionsLength <= 1;

    // Same for unread messages, we need to wait for the results from the OpenReport API call
    // if the oldest unread report action is not available yet. Only applies during the *first* load
    // for this report: after `hasOnceLoadedReportActions` is set, a later "mark as unread" must not
    // bring back this loading gate (we are not re-opening the report from a cold cache).
    const isUnreadMessagePageLoadingInitially = !reportActionIDFromRoute && isReportUnread && !oldestUnreadReportAction && !hasOnceLoadedReportActions;

    // Once all the above conditions are met, we can consider the report ready.
    const isReportLoading = isInitiallyLoadingReport || isUnreadMessagePageLoadingInitially;
    const isReportReady = isOffline || !isReportLoading;

    const isMissingTransactionThreadReportID = !transactionThreadReport?.reportID;
    const isReportDataIncomplete = isSingleExpenseReport && isMissingTransactionThreadReportID;

    const shouldShowSkeletonForInitialLoad = !!isLoadingInitialReportActions && (isReportDataIncomplete || isMissingReportActions) && !isOffline;

    const shouldShowSkeletonForAppLoad = !!isLoadingApp && !isOffline;

    // Show skeleton for the Concierge chat (side panel or main DM) until report
    // data has been loaded at least once. Before the first openReport response,
    // hasOlderActions is unreliable, so we can't determine whether to show the
    // greeting or onboarding messages. The skeleton avoids flashing wrong content.
    // hasOnceLoadedReportActions is RAM-only and resets on a page refresh, but
    // cached report actions persist in Onyx. For the main DM, render those cached
    // actions immediately (matching production) instead of flashing a skeleton on
    // every refresh; the side panel always opens fresh so it keeps gating on
    // hasOnceLoadedReportActions only. hasCachedReportActions is false only on a
    // genuinely cold load with no cached history (it excludes the synthetic CREATED
    // action that is always injected for Concierge).
    const shouldShowSkeletonForConciergePanel = isConciergeHiddenHistory && !hasOnceLoadedReportActions && !(isConciergeMainDM && hasCachedReportActions) && !isOffline;

    // When opening a linked message online, wait for the first load before rendering the list: the batch of
    // actions that arrives right after the initial load shifts the list and breaks the anchor to the linked action.
    const shouldShowSkeletonForLinkedMessageLoad = !!reportActionIDFromRoute && !isOffline && !hasOnceLoadedReportActions && !!isLoadingInitialReportActions;

    const shouldShowInitialSkeleton = shouldShowSkeletonForConciergePanel || shouldShowSkeletonForInitialLoad || shouldShowSkeletonForAppLoad || shouldShowSkeletonForLinkedMessageLoad;

    const hasDerivedValueTimingIssue = reportActionsLength > 0 && isMissingReportActions;

    const shouldShowLoadingSkeleton = isLoadingOnyxValue(reportResult) || !report || !isReportReady || shouldShowInitialSkeleton;
    const shouldShowDerivedTimingSkeleton = (hasDerivedValueTimingIssue || (!isReportTransactionThread && isMissingReportActions)) && !showConciergeSidePanelWelcome;

    return {
        shouldShowLoadingSkeleton,
        shouldShowDerivedTimingSkeleton,
        shouldShowInitialSkeleton,
    };
}

export {ReportActionsListStateContext, ReportActionsListActionsContext, useReportActionsListState, useReportActionsListActions, computeReportActionsSkeletonState};
