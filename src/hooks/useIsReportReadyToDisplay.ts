import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import type {Report} from '@src/types/onyx';

// @param hasStaleData: If the report param is retrieved from useOnyx with the allowStaleData option enabled, this parameter should be set to true.
// With allowStaleData, the report often contains outdated data, causing isCurrentReportLoadedFromOnyx to return false.
// This leads to dependent components being unmounted, resulting in a less smooth user experience.
// We should still allow these components to render with stale data, and only switch to a loading state when waiting for fresh data from the server via the OpenReport API.
function useIsReportReadyToDisplay(report: OnyxEntry<Report>, reportIDFromRoute: string | undefined, isReportArchived = false, hasStaleData = false, isLoadingReportFromOnyx?: boolean) {
    /**
     * When false the report is not ready to be fully displayed
     */
    const isCurrentReportLoadedFromOnyx = useMemo((): boolean => {
        // This is necessary so that when we are retrieving the next report data from Onyx the ReportActionsView will remount completely
        const isTransitioning = hasStaleData ? !isLoadingReportFromOnyx && !report?.reportID : report && report?.reportID !== reportIDFromRoute;
        return reportIDFromRoute !== '' && !!report?.reportID && !isTransitioning;
    }, [hasStaleData, isLoadingReportFromOnyx, report, reportIDFromRoute]);

    const isEditingDisabled = useMemo(
        () => !isCurrentReportLoadedFromOnyx || !canUserPerformWriteAction(report, isReportArchived),
        [isCurrentReportLoadedFromOnyx, report, isReportArchived],
    );

    return {
        isCurrentReportLoadedFromOnyx,
        isEditingDisabled,
    };
}

export default useIsReportReadyToDisplay;
