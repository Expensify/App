import {isExpenseReport} from '@libs/ReportUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OutstandingReportsByPolicyIDDerivedValue} from '@src/types/onyx';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID,
    dependencies: [ONYXKEYS.COLLECTION.REPORT],
    compute: ([reports]) => {
        if (!reports) {
            return {};
        }
        const outstandingReportsByPolicyID: OutstandingReportsByPolicyIDDerivedValue = {};
        for (const reportID of Object.keys(reports)) {
            const report = reports[reportID];
            if (!report) {
                continue;
            }

            // Get all reports, which are the ones that are:
            // - Expense reports
            // - Are either open or submitted
            // - Are not pending delete
            // - Belong to a workspace
            // This condition is similar to getOutstandingReportsForUser function
            if (
                isExpenseReport(report) &&
                report.policyID &&
                report?.pendingFields?.preview !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                (report.stateNum ?? CONST.REPORT.STATE_NUM.OPEN) <= CONST.REPORT.STATE_NUM.SUBMITTED
            ) {
                const reportsForPolicy = outstandingReportsByPolicyID[report.policyID] ?? {};
                reportsForPolicy[reportID] = report;
                outstandingReportsByPolicyID[report.policyID] = reportsForPolicy;
            }
        }

        return outstandingReportsByPolicyID;
    },
});
