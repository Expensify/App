import {createContext, useContext} from 'react';
import type {ReportActionsContentData, ReportActionsGuardData} from '@hooks/useReportActionsData';
import {isUnread} from '@libs/ReportUtils';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

/**
 * Carries `contentData` from the guard to `ReportActionsListContent` so the list renders from the same
 * derivations as the skeleton decision without re-subscribing.
 */
const ReportActionsDataContext = createContext<ReportActionsContentData | null>(null);

/** Read the report-actions pipeline outputs. Throws if used outside the guard's provider. */
function useReportActionsDataContext(): ReportActionsContentData {
    const value = useContext(ReportActionsDataContext);
    if (value === null) {
        throw new Error('useReportActionsDataContext must be used within a ReportActionsDataContext.Provider');
    }
    return value;
}

/**
 * Pure derivation of the two skeleton states from the pipeline bundle: a loading skeleton and the
 * derived-value-timing skeleton. The guard uses these to decide whether to render the list.
 */
function computeReportActionsSkeletonState(data: ReportActionsGuardData) {
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
    } = data;

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

    const shouldShowInitialSkeleton = shouldShowSkeletonForConciergePanel || shouldShowSkeletonForInitialLoad || shouldShowSkeletonForAppLoad;

    const hasDerivedValueTimingIssue = reportActionsLength > 0 && isMissingReportActions;

    const shouldShowLoadingSkeleton = isLoadingOnyxValue(reportResult) || !report || !isReportReady || shouldShowInitialSkeleton;
    const shouldShowDerivedTimingSkeleton = (hasDerivedValueTimingIssue || (!isReportTransactionThread && isMissingReportActions)) && !showConciergeSidePanelWelcome;

    return {
        shouldShowLoadingSkeleton,
        shouldShowDerivedTimingSkeleton,
        shouldShowInitialSkeleton,
    };
}

export default ReportActionsDataContext;
export {useReportActionsDataContext, computeReportActionsSkeletonState};
