import type {Report} from '@src/types/onyx';
import * as ReportActionFile from './actions/Report';
import * as ReportConnection from './ReportConnection';
import * as ReportUtils from './ReportUtils';

export default function markAllPolicyReportsAsRead(policyID: string) {
    let delay = 0;
    const allReports = ReportConnection.getAllReports() ?? {};
    Object.keys(allReports).forEach((key: string) => {
        const report: Report | null | undefined = allReports[key];
        if (report?.policyID !== policyID || !ReportUtils.isUnread(report)) {
            return;
        }

        setTimeout(() => {
            ReportActionFile.readNewestAction(report?.reportID);
        }, delay);

        delay += 1000;
    });
}
