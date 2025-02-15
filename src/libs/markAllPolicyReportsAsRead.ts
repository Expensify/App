import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions} from '@src/types/onyx';
import * as ReportActionFile from './actions/Report';
import {getOneTransactionThreadReportID} from './ReportActionsUtils';
import * as ReportUtils from './ReportUtils';

let allReports: OnyxCollection<Report> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

let allReportActions: OnyxCollection<ReportActions> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReportActions = value;
    },
});

export default function markAllPolicyReportsAsRead(policyID: string) {
    let delay = 0;
    Object.keys(allReports ?? {}).forEach((key: string) => {
        const report = allReports?.[key];
        const oneTransactionThreadReportID = getOneTransactionThreadReportID(report?.reportID, allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`]);
        const oneTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`];
        if (report?.policyID !== policyID || !ReportUtils.isUnread(report, oneTransactionThreadReport)) {
            return;
        }

        setTimeout(() => {
            ReportActionFile.readNewestAction(report?.reportID);
        }, delay);

        delay += 1000;
    });
}
