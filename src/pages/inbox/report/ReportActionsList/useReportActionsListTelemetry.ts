/** Completes warm report spans once positioned content is visible, including when the report regains focus. */
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';

import {useReportActionsListState} from '@pages/inbox/report/ReportActionsListContext';

import {useIsFocused} from '@react-navigation/native';
import {useEffect} from 'react';

import type {UseReportActionsListTelemetryParams} from './types';

function useReportActionsListTelemetry({reportID, listID, loadedInitialViewportListID, shouldShowInitialViewportSkeleton}: UseReportActionsListTelemetryParams) {
    const isFocused = useIsFocused();
    const {report} = useReportActionsListState();

    useEffect(() => {
        if (!isFocused || shouldShowInitialViewportSkeleton || loadedInitialViewportListID !== listID) {
            return;
        }
        // onReady positions the list, but only this committed render has removed its cover.
        // Refocus also completes new spans when the positioned list stays mounted.
        markOpenReportEnd(reportID, report, {warm: true});
    }, [isFocused, listID, loadedInitialViewportListID, report, reportID, shouldShowInitialViewportSkeleton]);
}

export default useReportActionsListTelemetry;
