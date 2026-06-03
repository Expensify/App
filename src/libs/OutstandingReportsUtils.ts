import type {OnyxCollection} from 'react-native-onyx';
import {isExpenseReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {OutstandingReportsByPolicyIDDerivedValue, Report} from '@src/types/onyx';

/**
 * Groups open/submitted workspace expense reports by policy ID.
 * Mirrors the compute logic in outstandingReportsByPolicyID derived config.
 */
function getOutstandingReportsByPolicyIDFromReportCollection(reports: OnyxCollection<Report> | undefined): OutstandingReportsByPolicyIDDerivedValue {
    if (!reports) {
        return {};
    }

    return Object.entries(reports).reduce<OutstandingReportsByPolicyIDDerivedValue>((acc, [reportID, report]) => {
        if (!report) {
            return acc;
        }

        if (
            isExpenseReport(report) &&
            report.policyID &&
            report.pendingFields?.preview !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
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
}

export default getOutstandingReportsByPolicyIDFromReportCollection;
