import {getPreMountedDraftReportCleanupData} from '@libs/cleanupPreMountedDraftReports';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

describe('getPreMountedDraftReportCleanupData', () => {
    it('removes an interrupted pre-mounted report and its marker when the draft still exists', () => {
        // Given a stale pre-mount marker whose original draft still exists
        const reportID = '123';

        // When cleanup data is derived after an interrupted pre-mount
        // Then both speculative records are cleared because submission never completed
        expect(
            getPreMountedDraftReportCleanupData(
                {[`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`]: true},
                {[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`]: {reportID} as Report},
            ),
        ).toEqual({
            [`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`]: null,
            [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: null,
        });
    });

    it('preserves a submitted report when its draft no longer exists', () => {
        // Given a stale pre-mount marker whose draft was removed by successful submission
        const reportID = '123';

        // When cleanup data is derived after the pre-mount completes
        // Then only the marker is cleared because the report is now authoritative
        expect(getPreMountedDraftReportCleanupData({[`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`]: true}, {})).toEqual({
            [`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`]: null,
        });
    });
});
