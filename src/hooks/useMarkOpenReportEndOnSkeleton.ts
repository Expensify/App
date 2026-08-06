import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect} from 'react';

/**
 * Closes the open-report performance span as a cold open (`warm: false`) the moment a cold-load skeleton
 * appears. Shared by every report surface that gates its own skeleton (the chat-list guard, the route
 * orchestrator, and the money-request views): the open-report span must still close even though the list
 * body — which would otherwise own this mark once mounted — isn't mounted while the skeleton shows.
 */
function useMarkOpenReportEndOnSkeleton(report: OnyxEntry<OnyxTypes.Report>, isSkeletonVisible: boolean) {
    useEffect(() => {
        if (!isSkeletonVisible || !report) {
            return;
        }
        markOpenReportEnd(report, {warm: false});
    }, [report, isSkeletonVisible]);
}

export default useMarkOpenReportEndOnSkeleton;
