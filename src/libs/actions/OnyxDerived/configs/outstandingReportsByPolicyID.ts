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
        const outstandingReportsByPolicyID = Object.entries(reports ?? {}).reduce<OutstandingReportsByPolicyIDDerivedValue>((acc, [reportID, report]) => {
            if (!report) {
                return acc;
            }

            // Get all reports, which are the ones that are:
            // - Expense reports
            // - Are either open or submitted
            // - Are not pending delete
            // - Belong to a workspace
            // This condition is similar to reportsByPolicyID and getOutstandingReportsForUser function
            if (
                isExpenseReport(report) &&
                report.policyID &&
                report?.pendingFields?.preview !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                (report.stateNum ?? CONST.REPORT.STATE_NUM.OPEN) <= CONST.REPORT.STATE_NUM.SUBMITTED
            ) {
                if (!acc[report.policyID]) {
                    acc[report.policyID] = {};
                }

                acc[report.policyID] = {
                    ...acc[report.policyID],
                    [reportID]: report,
                };
            }

            return acc;
        }, {});

        return outstandingReportsByPolicyID;
    },
});
