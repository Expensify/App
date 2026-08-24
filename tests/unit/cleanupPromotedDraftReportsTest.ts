import {getPromotedDraftReportCleanupData} from '@libs/cleanupPromotedDraftReports';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

describe('getPromotedDraftReportCleanupData', () => {
    it('removes an interrupted promoted report and its marker when the draft still exists', () => {
        // Given a stale promotion whose original draft still exists
        const reportID = '123';

        // When cleanup data is derived after an interrupted promotion
        // Then both speculative records are cleared because submission never completed
        expect(
            getPromotedDraftReportCleanupData(
                {[`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`]: true},
                {[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`]: {reportID} as Report},
            ),
        ).toEqual({
            [`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`]: null,
            [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: null,
        });
    });

    it('preserves a submitted report when its draft no longer exists', () => {
        // Given a stale promotion whose draft was removed by successful submission
        const reportID = '123';

        // When cleanup data is derived after promotion completes
        // Then only the marker is cleared because the report is now authoritative
        expect(getPromotedDraftReportCleanupData({[`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`]: true}, {})).toEqual({
            [`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`]: null,
        });
    });
});
