import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {handlePreexistingReport} from '@libs/actions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

let allReportDraftComments: Record<string, string | undefined> = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
    waitForCollectionCallback: true,
    callback: (value) => (allReportDraftComments = value ?? {}),
});

Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value: OnyxCollection<Report>) => {
        if (!value) {
            return;
        }

        for (const report of Object.values(value)) {
            if (!report) {
                continue;
            }

            handlePreexistingReport(report, allReportDraftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`]);
        }
    },
});

export default {};
