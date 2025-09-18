import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions} from '@src/types/onyx';
import {readNewestAction} from './actions/Report';
import {getOneTransactionThreadReportID} from './ReportActionsUtils';
import {isUnread} from './ReportUtils';

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
        const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
        const oneTransactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`]);
        const oneTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`];
        if (report?.policyID !== policyID || !isUnread(report, oneTransactionThreadReport)) {
            return;
        }

        setTimeout(() => {
            readNewestAction(report?.reportID);
        }, delay);

        delay += 1000;
    });
}
