import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import {getApprovalChain, isOpenExpenseReport, isProcessingReport, isSettled} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {PersonalDetailsList, Policy, Report, Rule} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import type {ReportHistoryStep} from './types';

import {REPORT_HISTORY_ACTION} from './types';

// TODO: Remove once the backend returns report history. https://github.com/Expensify/App/issues/103160
function getMockReportHistorySteps(report: Report, policy: OnyxEntry<Policy>, rules: OnyxCollection<Rule>, personalDetails: OnyxEntry<PersonalDetailsList>): ReportHistoryStep[] {
    const getAccountIDByLogin = (login: string | undefined) => Object.values(personalDetails ?? {}).find((detail) => !!login && detail?.login === login)?.accountID;

    const ownerAccountID = report.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const ownerLogin = getLoginByAccountID(ownerAccountID, personalDetails);
    const approverAccountIDs = getApprovalChain(policy, report, ownerLogin, rules)
        .map(getAccountIDByLogin)
        .filter((accountID): accountID is number => !!accountID);
    if (approverAccountIDs.length === 0 && report.managerID) {
        approverAccountIDs.push(report.managerID);
    }
    const payerAccountID = getAccountIDByLogin(policy?.reimburser ?? policy?.achAccount?.reimburser ?? policy?.owner) ?? approverAccountIDs.at(-1) ?? ownerAccountID;

    const isOpen = isOpenExpenseReport(report);
    const isPaid = isSettled(report);
    const currentApproverIndex = approverAccountIDs.indexOf(report.managerID ?? CONST.DEFAULT_NUMBER_ID);
    let approvedCount = approverAccountIDs.length;
    if (isOpen) {
        approvedCount = 0;
    } else if (isProcessingReport(report)) {
        approvedCount = Math.max(currentApproverIndex, 0);
    }

    const now = Date.now();
    let remainingCompletedSteps = (isOpen ? 1 : 2) + approvedCount + (isPaid ? 1 : 0);
    const nextTimestamp = () => {
        const timestamp = new Date(now - remainingCompletedSteps * 6 * 60 * 60 * 1000).toISOString();
        remainingCompletedSteps -= 1;
        return timestamp;
    };

    const steps: ReportHistoryStep[] = [
        {action: REPORT_HISTORY_ACTION.CREATED, accountID: ownerAccountID, created: nextTimestamp(), isCompleted: true},
        isOpen
            ? {action: REPORT_HISTORY_ACTION.SUBMITTED, accountID: ownerAccountID, isCompleted: false}
            : {action: REPORT_HISTORY_ACTION.SUBMITTED, accountID: ownerAccountID, created: nextTimestamp(), isCompleted: true},
    ];

    for (const [index, accountID] of approverAccountIDs.entries()) {
        const isApproved = index < approvedCount;
        steps.push({action: REPORT_HISTORY_ACTION.APPROVED, accountID, created: isApproved ? nextTimestamp() : undefined, isCompleted: isApproved});
    }

    steps.push({action: REPORT_HISTORY_ACTION.PAID, accountID: payerAccountID, created: isPaid ? nextTimestamp() : undefined, isCompleted: isPaid});

    return steps;
}

export default getMockReportHistorySteps;
