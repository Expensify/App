import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

import type {ReportHistoryStep} from './types';

import {REPORT_HISTORY_ACTION} from './types';

// TODO: Remove once the backend returns report history. https://github.com/Expensify/App/issues/103160
function getMockReportHistorySteps(report: Report): ReportHistoryStep[] {
    const ownerAccountID = report.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const managerAccountID = report.managerID ?? ownerAccountID;
    const now = Date.now();
    const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

    return [
        {
            action: REPORT_HISTORY_ACTION.CREATED,
            accountID: ownerAccountID,
            created: daysAgo(7),
            isCompleted: true,
        },
        {
            action: REPORT_HISTORY_ACTION.SUBMITTED,
            accountID: ownerAccountID,
            created: daysAgo(7),
            isCompleted: true,
        },
        {
            action: REPORT_HISTORY_ACTION.APPROVED,
            accountID: managerAccountID,
            created: daysAgo(6),
            isCompleted: true,
        },
        {
            action: REPORT_HISTORY_ACTION.HELD,
            accountID: managerAccountID,
            created: daysAgo(6),
            isCompleted: true,
        },
        {
            action: REPORT_HISTORY_ACTION.APPROVED,
            accountID: managerAccountID,
            isCompleted: false,
        },
        {
            action: REPORT_HISTORY_ACTION.PAID,
            accountID: managerAccountID,
            isCompleted: false,
        },
    ];
}

export default getMockReportHistorySteps;
