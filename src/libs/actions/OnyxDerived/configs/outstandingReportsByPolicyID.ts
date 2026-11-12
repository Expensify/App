import {isExpenseReport} from '@libs/ReportUtils';

import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OutstandingReportsByPolicyIDDerivedValue} from '@src/types/onyx';

import {shallowEqual} from 'fast-equals';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID,
    dependencies: [ONYXKEYS.COLLECTION.REPORT],
    compute: ([reports], {currentValue}) => {
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

        // Consumers of this key compare by reference, so handing back `currentValue` when nothing moved keeps them
        // from re-rendering, and lets the engine skip the write entirely. Every `REPORT` write recomputes this, and
        // for an account with no outstanding reports the result is a fresh empty object every time.
        return currentValue && shallowEqual(currentValue, outstandingReportsByPolicyID) ? currentValue : outstandingReportsByPolicyID;
    },
});
