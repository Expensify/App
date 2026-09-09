import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

import useOnyx from './useOnyx';

/**
 * Closes the open-report span as a cold open (`warm: false`) while a skeleton shows. Call it from a component
 * mounted exactly while the skeleton is on screen. The list body that would otherwise close the span isn't
 * mounted yet.
 */
function useMarkOpenReportEndOnSkeleton(reportID: string | undefined, isSkeletonVisible = true) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);

    useEffect(() => {
        if (!isSkeletonVisible || !reportID) {
            return;
        }
        markOpenReportEnd(reportID, report, {warm: false});
    }, [reportID, report, isSkeletonVisible]);
}

export default useMarkOpenReportEndOnSkeleton;
