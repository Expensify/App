import type {ReactNode} from 'react';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import usePendingConciergeResponse from '@hooks/usePendingConciergeResponse';
import useReportActionsData from '@hooks/useReportActionsData';
import {updateLoadingInitialReportAction} from '@libs/actions/Report';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';
import ReportActionsDataContext, {computeReportActionsSkeletonState} from './ReportActionsDataContext';

type ReportActionsSkeletonGuardProps = {
    /** The ID of the report to display actions for */
    reportID: string;

    /** The report-actions list content, rendered only once content is ready */
    children: ReactNode;
};

/**
 * Skeleton gate for the report-actions list, modeled on `ReportNotFoundGuard`.
 *
 * Owns the single data pipeline (`useReportActionsData`) and the fine-grained skeleton decision, plus
 * every effect that must run while the skeleton shows (concierge session start, the linked-message
 * offline loading effect, and the warm:false open-report telemetry). It returns either the skeleton or
 * the `children` (wrapped in `ReportActionsDataContext` so they render from the same pipeline).
 *
 * Because the UI-close hooks live in `children`, gating here means they are never mounted while a
 * skeleton shows, so they cannot run during it.
 *
 * A forward latch keeps the full skeleton from reappearing once content has rendered: a transient
 * empty visible-actions set must not unmount the content mid-session (which would tear down its scroll
 * position and subscriptions). Because the UI-close hooks are no longer gated, this also means that
 * after first content they stay active through such transients (mark-as-read, live-tail subscription)
 * instead of being suppressed. That is intentional: content is on screen, so it should behave as visible.
 */
function ReportActionsSkeletonGuard({reportID, children}: ReportActionsSkeletonGuardProps) {
    const data = useReportActionsData(reportID);
    const {report, isOffline, reportActionIDFromRoute, isConciergeMainDM, canStartConciergeSession, startSession, oldestUnreadReportAction, currentReportID} = data;

    const {shouldShowLoadingSkeleton, shouldShowDerivedTimingSkeleton, shouldShowInitialSkeleton} = computeReportActionsSkeletonState(data);
    const shouldShowSkeleton = shouldShowLoadingSkeleton || shouldShowDerivedTimingSkeleton;

    // Forward latch: once content has shown, never return the full skeleton again for this mount.
    const [hasShownContent, setHasShownContent] = useState(false);
    if (!hasShownContent && !shouldShowSkeleton) {
        setHasShownContent(true);
    }

    // Side effects that must run whenever the chat list is shown, including while the skeleton renders.
    useCopySelectionHelper();
    usePendingConciergeResponse(reportID);

    useEffect(() => {
        // When we linked to message - we do not need to wait for initial actions - they already exists
        if (!reportActionIDFromRoute || !isOffline) {
            return;
        }
        updateLoadingInitialReportAction(report?.reportID ?? reportID);
    }, [isOffline, report?.reportID, reportID, reportActionIDFromRoute]);

    useLayoutEffect(() => {
        if (!isConciergeMainDM || !canStartConciergeSession) {
            return;
        }
        startSession(oldestUnreadReportAction ? report?.lastReadTime : undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- startSession is stable; captured values at mount only
    }, [isConciergeMainDM, startSession, canStartConciergeSession]);

    // On native the component stays mounted in the navigation stack, so the
    // effect above never re-fires (its isConciergeMainDM dep is always true).
    // Re-trigger startSession when the globally-focused report matches this
    // report so the session age check runs after navigating away and back.
    useLayoutEffect(() => {
        if (!isConciergeMainDM || !canStartConciergeSession || currentReportID !== reportID) {
            return;
        }
        startSession(oldestUnreadReportAction ? report?.lastReadTime : undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to currentReportID returning to this report
    }, [currentReportID, reportID, isConciergeMainDM, canStartConciergeSession, startSession]);

    useEffect(() => {
        if (!shouldShowInitialSkeleton || !report) {
            return;
        }
        markOpenReportEnd(report, {warm: false});
    }, [report, shouldShowInitialSkeleton]);

    if (!hasShownContent && shouldShowLoadingSkeleton) {
        return <ReportActionsSkeletonView />;
    }

    if (!hasShownContent && shouldShowDerivedTimingSkeleton) {
        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }

    return <ReportActionsDataContext.Provider value={data}>{children}</ReportActionsDataContext.Provider>;
}

ReportActionsSkeletonGuard.displayName = 'ReportActionsSkeletonGuard';

export default ReportActionsSkeletonGuard;
