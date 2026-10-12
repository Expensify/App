import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxMultiSetInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Copies an already-built draft report into COLLECTION.REPORT so a pre-mounted destination screen can render immediately.
 * Also writes a persisted marker so an interrupted flow (app killed before submit) can be cleaned up on the next launch.
 */
function preMountDraftReport(reportID: string, draftReport: Report) {
    const preMountData: OnyxMultiSetInput = {};
    preMountData[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = draftReport;
    preMountData[`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`] = true;
    return Onyx.multiSet(preMountData);
}

/**
 * Removes a report created by `preMountDraftReport`, for when the caller backs out before submission actually happens.
 */
function clearPreMountedDraftReport(reportID: string) {
    return Onyx.multiSet({
        [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: null,
        [`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`]: null,
    });
}

/**
 * Clears only the pre-mount marker left by `preMountDraftReport`.
 */
function clearPreMountedDraftReportMarker(reportID: string) {
    return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`, null);
}

export {preMountDraftReport, clearPreMountedDraftReport, clearPreMountedDraftReportMarker};
