import {useEffect} from 'react';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';
import type {ReportActionsReadinessSignals} from './useReportActionsListModel';

type UseReportActionsSkeletonTelemetryParams = Pick<ReportActionsReadinessSignals, 'report'> & {
    /** Whether the initial-load skeleton is showing */
    shouldShowInitialSkeleton: boolean;
};

/**
 * Records the warm:false open-report end. Lives in the guard, not the content, because it must fire while
 * the skeleton shows, when the content isn't mounted.
 */
function useReportActionsSkeletonTelemetry({report, shouldShowInitialSkeleton}: UseReportActionsSkeletonTelemetryParams) {
    useEffect(() => {
        if (!shouldShowInitialSkeleton || !report) {
            return;
        }
        markOpenReportEnd(report, {warm: false});
    }, [report, shouldShowInitialSkeleton]);
}

export default useReportActionsSkeletonTelemetry;
