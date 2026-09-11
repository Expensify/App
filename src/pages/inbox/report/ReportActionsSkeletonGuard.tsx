import useBackfillWhenNoVisibleActions from '@hooks/useBackfillWhenNoVisibleActions';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import {useIsReportLoadPending} from '@hooks/useInFlightRequests';
import usePendingConciergeResponse from '@hooks/usePendingConciergeResponse';
import useReportActionsListModel from '@hooks/useReportActionsListModel';
import useStartConciergeSession from '@hooks/useStartConciergeSession';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React from 'react';

import {computeReportActionsSkeletonState, ReportActionsListActionsContext, ReportActionsListStateContext} from './ReportActionsListContext';
import ReportActionsLoadingSkeleton from './ReportActionsLoadingSkeleton';

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
    const isReportLoadPending = useIsReportLoadPending(reportID);
    const {readinessSignals, state, actions} = useReportActionsListModel(reportID, isReportLoadPending);
    const {shouldShowLoadingSkeleton, shouldShowDerivedTimingSkeleton} = computeReportActionsSkeletonState(readinessSignals);

    const {
        isConciergeMainDM,
        oldestUnreadReportAction,
        hasOnceLoadedReportActions,
        hasCachedReportActions,
        isMissingReportActions,
        hasOlderActions,
        hasNewerActions,
        isOffline,
        isLoadingOlderReportActions,
        hasLoadingOlderReportActionsError,
        oldestReportActionID,
    } = readinessSignals;

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

    useBackfillWhenNoVisibleActions({
        reportID,
        isMissingReportActions,
        hasOlderActions,
        hasNewerActions,
        isOffline,
        isReportLoadPending,
        isLoadingOlderReportActions,
        hasLoadingOlderReportActionsError,
        oldestReportActionID,
        loadOlderChats: actions.loadOlderChats,
    });

    if (shouldShowLoadingSkeleton) {
        return (
            <ReportActionsLoadingSkeleton
                reportID={reportID}
                skeletonName={CONST.TELEMETRY.CANCELED_BY_SKELETON.SKELETON_GUARD_LOADING}
            />
        );
    }

    if (shouldShowDerivedTimingSkeleton) {
        return (
            <ReportActionsLoadingSkeleton
                reportID={reportID}
                skeletonName={CONST.TELEMETRY.CANCELED_BY_SKELETON.SKELETON_GUARD_DERIVED_TIMING}
                shouldAnimate={false}
            />
        );
    }

    return (
        <ReportActionsListActionsContext.Provider value={actions}>
            <ReportActionsListStateContext.Provider value={state}>{children}</ReportActionsListStateContext.Provider>
        </ReportActionsListActionsContext.Provider>
    );
}

export default ReportActionsSkeletonGuard;
