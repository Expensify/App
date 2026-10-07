import {isOpenExpenseReport, isProcessingReport, isSettled} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

import type {ReportHistoryStep} from './types';

import {REPORT_HISTORY_ACTION} from './types';

// TODO: Remove once the backend returns report history. https://github.com/Expensify/App/issues/103160
function getMockReportHistorySteps(report: Report): ReportHistoryStep[] {
    const ownerAccountID = report.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const managerAccountID = report.managerID ?? ownerAccountID;
    const otherAccountIDs = Object.keys(report.participants ?? {})
        .map(Number)
        .filter((accountID) => accountID !== ownerAccountID && accountID !== managerAccountID);
    const firstApproverAccountID = otherAccountIDs.at(0) ?? managerAccountID;
    const finalApproverAccountID = otherAccountIDs.at(1) ?? managerAccountID;
    const payerAccountID = otherAccountIDs.at(2) ?? finalApproverAccountID;

    const now = Date.now();
    const minutesAgo = (minutes: number) => new Date(now - minutes * 60 * 1000).toISOString();
    const hoursAgo = (hours: number) => minutesAgo(hours * 60);
    const daysAgo = (days: number) => hoursAgo(days * 24);

    if (isOpenExpenseReport(report)) {
        return [
            {action: REPORT_HISTORY_ACTION.CREATED, accountID: ownerAccountID, created: minutesAgo(25), isCompleted: true},
            {action: REPORT_HISTORY_ACTION.SUBMITTED, accountID: ownerAccountID, isCompleted: false},
            {action: REPORT_HISTORY_ACTION.APPROVED, accountID: managerAccountID, isCompleted: false},
            {action: REPORT_HISTORY_ACTION.PAID, accountID: payerAccountID, isCompleted: false},
        ];
    }

    if (isProcessingReport(report)) {
        return [
            {action: REPORT_HISTORY_ACTION.CREATED, accountID: ownerAccountID, created: daysAgo(7), isCompleted: true},
            {action: REPORT_HISTORY_ACTION.SUBMITTED, accountID: ownerAccountID, created: daysAgo(7), isCompleted: true},
            {action: REPORT_HISTORY_ACTION.APPROVED, accountID: firstApproverAccountID, created: daysAgo(6), isCompleted: true},
            {action: REPORT_HISTORY_ACTION.REROUTED, accountID: finalApproverAccountID, created: hoursAgo(5), isCompleted: true},
            {action: REPORT_HISTORY_ACTION.HELD, accountID: managerAccountID, created: minutesAgo(40), isCompleted: true},
            {action: REPORT_HISTORY_ACTION.APPROVED, accountID: managerAccountID, isCompleted: false},
            {action: REPORT_HISTORY_ACTION.APPROVED, accountID: finalApproverAccountID, isCompleted: false},
            {action: REPORT_HISTORY_ACTION.PAID, accountID: payerAccountID, isCompleted: false},
        ];
    }

    const approvedSteps: ReportHistoryStep[] = [
        {action: REPORT_HISTORY_ACTION.CREATED, accountID: ownerAccountID, created: daysAgo(14), isCompleted: true},
        {action: REPORT_HISTORY_ACTION.SUBMITTED, accountID: ownerAccountID, created: daysAgo(13), isCompleted: true},
        {action: REPORT_HISTORY_ACTION.APPROVED, accountID: managerAccountID, created: daysAgo(10), isCompleted: true},
        {action: REPORT_HISTORY_ACTION.APPROVED, accountID: finalApproverAccountID, created: daysAgo(2), isCompleted: true},
    ];

    if (isSettled(report)) {
        return [...approvedSteps, {action: REPORT_HISTORY_ACTION.PAID, accountID: payerAccountID, created: hoursAgo(3), isCompleted: true}];
    }

    return [...approvedSteps, {action: REPORT_HISTORY_ACTION.PAID, accountID: payerAccountID, isCompleted: false}];
}

export default getMockReportHistorySteps;
