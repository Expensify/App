import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import * as ReportActionFile from './actions/Report';
import * as ReportUtils from './ReportUtils';

let allReports: OnyxCollection<Report> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

export default function markAllPolicyReportsAsRead(policyID: string) {
    let delay = 0;
    Object.keys(allReports ?? {}).forEach((key: string) => {
        const report = allReports?.[key];
        if (report?.policyID !== policyID || !ReportUtils.isUnread(report)) {
            return;
        }

        setTimeout(() => {
            ReportActionFile.readNewestAction(report?.reportID);
        }, delay);

        delay += 1000;
    });
}
