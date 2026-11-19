import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';

import {useReportActionsListState} from '@pages/inbox/report/ReportActionsListContext';

import type {LayoutChangeEvent} from 'react-native';

import {useEffect, useRef} from 'react';

import type {UseReportActionsListTelemetryParams} from './types';

/** Returns the list layout handler, which completes the warm open-report span on the first layout. */
function useReportActionsListTelemetry({reportID, onLayout}: UseReportActionsListTelemetryParams) {
    const {report} = useReportActionsListState();
    const didLayout = useRef(false);

    useEffect(() => {
        didLayout.current = false;
    }, [reportID]);

    /**
     * Runs when the FlatList finishes laying out
     */
    return (event: LayoutChangeEvent) => {
        onLayout?.(event);
        if (didLayout.current) {
            return;
        }

        didLayout.current = true;

        markOpenReportEnd(reportID, report, {warm: true});
    };
}

export default useReportActionsListTelemetry;
