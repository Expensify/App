import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import type {Report, ReportNameValuePairs} from '@src/types/onyx';

function useIsReportReadyToDisplay(report: OnyxEntry<Report>, reportNameValuePairs: OnyxCollection<ReportNameValuePairs>, reportIDFromRoute: string | undefined) {
    /**
     * When false the report is not ready to be fully displayed
     */
    const isCurrentReportLoadedFromOnyx = useMemo((): boolean => {
        // This is necessary so that when we are retrieving the next report data from Onyx the ReportActionsView will remount completely
        const isTransitioning = report && report?.reportID !== reportIDFromRoute;
        return reportIDFromRoute !== '' && !!report?.reportID && !isTransitioning;
    }, [report, reportIDFromRoute]);

    const isEditingDisabled = useMemo(() => !isCurrentReportLoadedFromOnyx || !canUserPerformWriteAction(report, reportNameValuePairs), [isCurrentReportLoadedFromOnyx, report]);

    return {
        isCurrentReportLoadedFromOnyx,
        isEditingDisabled,
    };
}

export default useIsReportReadyToDisplay;
