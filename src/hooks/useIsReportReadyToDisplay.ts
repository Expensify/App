import {canUserPerformWriteAction} from '@libs/ReportUtils';

import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

function useIsReportReadyToDisplay(report: OnyxEntry<Report>, reportIDFromRoute: string | undefined, isReportArchived: boolean | undefined) {
    /**
     * When false the report is not ready to be fully displayed
     */
    // This is necessary so that when we are retrieving the next report data from Onyx the ReportActionsList will remount completely
    const isTransitioning = report && report?.reportID?.toString() !== reportIDFromRoute;
    const isCurrentReportLoadedFromOnyx = reportIDFromRoute !== '' && !!report?.reportID && !isTransitioning;

    const isEditingDisabled = !isCurrentReportLoadedFromOnyx || !canUserPerformWriteAction(report, isReportArchived);

    return {
        isCurrentReportLoadedFromOnyx,
        isEditingDisabled,
    };
}

export default useIsReportReadyToDisplay;
