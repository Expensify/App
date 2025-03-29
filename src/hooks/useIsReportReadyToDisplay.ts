import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import type {Report} from '@src/types/onyx';

function useIsReportReadyToDisplay(report: OnyxEntry<Report>, reportIDFromRoute: string | undefined) {
    /**
     * When false the report is not ready to be fully displayed
     */
    const isCurrentReportLoadedFromOnyx = useMemo((): boolean => {
        // This is necessary so that when we are retrieving the next report data from Onyx the ReportActionsView will remount completely
        const isTransitioning = report && report?.reportID !== reportIDFromRoute;
        return reportIDFromRoute !== '' && !!report?.reportID && !isTransitioning;
    }, [report, reportIDFromRoute]);

    const isEditingDisabled = useMemo(() => !isCurrentReportLoadedFromOnyx || !canUserPerformWriteAction(report), [isCurrentReportLoadedFromOnyx, report]);

    return {
        isCurrentReportLoadedFromOnyx,
        isEditingDisabled,
    };
}

export default useIsReportReadyToDisplay;
