import type {ReactNode} from 'react';
import React, {useState} from 'react';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import usePendingConciergeResponse from '@hooks/usePendingConciergeResponse';
import useReportActionsListModel from '@hooks/useReportActionsListModel';
import useReportActionsSkeletonTelemetry from '@hooks/useReportActionsSkeletonTelemetry';
import useStartConciergeSession from '@hooks/useStartConciergeSession';
import {computeReportActionsSkeletonState, ReportActionsListActionsContext, ReportActionsListStateContext} from './ReportActionsListContext';

type ReportActionsSkeletonGuardProps = {
    /** The ID of the report to display actions for */
    reportID: string;

    /** The report-actions list content, rendered only once content is ready */
    children: ReactNode;
};

/**
 * Skeleton gate for the report-actions list, modeled on `ReportNotFoundGuard`. Owns the data pipeline
 * (`useReportActionsListModel`) and the skeleton decision, returning either the skeleton or `children`
 * (wrapped in `ReportActionsListStateContext`/`ReportActionsListActionsContext` so they render from the same
 * pipeline). Skeleton-phase effects live in dedicated hooks here because `children` isn't mounted yet; the
 * list's UI-close hooks live in `children`, so they can't run while the skeleton shows.
 *
 * The forward latch stops a transient empty visible-actions set from unmounting content mid-session (which
 * would tear down its scroll position and subscriptions). After first content the UI-close hooks therefore
 * stay active through such transients, which is intended: content is on screen, so treat it as visible.
 */
function ReportActionsSkeletonGuard({reportID, children}: ReportActionsSkeletonGuardProps) {
    const {readinessSignals, state, actions} = useReportActionsListModel(reportID);
    const {shouldShowLoadingSkeleton, shouldShowDerivedTimingSkeleton, shouldShowInitialSkeleton} = computeReportActionsSkeletonState(readinessSignals);
    const shouldShowSkeleton = shouldShowLoadingSkeleton || shouldShowDerivedTimingSkeleton;

    // Forward latch: once content has shown, never return the full skeleton again for this mount.
    const [hasShownContent, setHasShownContent] = useState(false);
    if (!hasShownContent && !shouldShowSkeleton) {
        setHasShownContent(true);
    }

    const {report, isConciergeMainDM, oldestUnreadReportAction, hasOnceLoadedReportActions, hasCachedReportActions} = readinessSignals;

    // Side effects that must run whenever the chat list is shown, including while the skeleton renders.
    useCopySelectionHelper();
    usePendingConciergeResponse(reportID);

    useStartConciergeSession({
        reportID,
        lastReadTime: report?.lastReadTime,
        isConciergeMainDM,
        oldestUnreadReportAction,
        hasOnceLoadedReportActions,
        hasCachedReportActions,
    });

    useReportActionsSkeletonTelemetry({report, shouldShowInitialSkeleton});

    if (!hasShownContent && shouldShowLoadingSkeleton) {
        return <ReportActionsSkeletonView />;
    }

    if (!hasShownContent && shouldShowDerivedTimingSkeleton) {
        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }

    return (
        <ReportActionsListActionsContext.Provider value={actions}>
            <ReportActionsListStateContext.Provider value={state}>{children}</ReportActionsListStateContext.Provider>
        </ReportActionsListActionsContext.Provider>
    );
}

export default ReportActionsSkeletonGuard;
