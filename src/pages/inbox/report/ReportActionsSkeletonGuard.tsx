import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import useMarkOpenReportEndOnSkeleton from '@hooks/useMarkOpenReportEndOnSkeleton';
import usePendingConciergeResponse from '@hooks/usePendingConciergeResponse';
import useReportActionsListModel from '@hooks/useReportActionsListModel';
import useStartConciergeSession from '@hooks/useStartConciergeSession';

import type {ReactNode} from 'react';

import React from 'react';

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
 */
function ReportActionsSkeletonGuard({reportID, children}: ReportActionsSkeletonGuardProps) {
    const {readinessSignals, state, actions} = useReportActionsListModel(reportID);
    const {shouldShowLoadingSkeleton, shouldShowDerivedTimingSkeleton, shouldShowInitialSkeleton} = computeReportActionsSkeletonState(readinessSignals);

    const {report, isConciergeMainDM, oldestUnreadReportAction, hasOnceLoadedReportActions, hasCachedReportActions} = readinessSignals;

    // Side effects that must run whenever the chat list is shown, including while the skeleton renders.
    useCopySelectionHelper();
    usePendingConciergeResponse(reportID);

    useStartConciergeSession({
        reportID,
        isConciergeMainDM,
        oldestUnreadReportAction,
        hasOnceLoadedReportActions,
        hasCachedReportActions,
    });

    useMarkOpenReportEndOnSkeleton(report, shouldShowInitialSkeleton);

    if (shouldShowLoadingSkeleton) {
        return <ReportActionsSkeletonView />;
    }

    if (shouldShowDerivedTimingSkeleton) {
        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }

    return (
        <ReportActionsListActionsContext.Provider value={actions}>
            <ReportActionsListStateContext.Provider value={state}>{children}</ReportActionsListStateContext.Provider>
        </ReportActionsListActionsContext.Provider>
    );
}

export default ReportActionsSkeletonGuard;
