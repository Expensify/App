import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import {getApprovalChain, isOpenExpenseReport, isProcessingReport, isSettled} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {PersonalDetailsList, Policy, Report, Rule} from '@src/types/onyx';
import type {ReportUpcomingStep} from '@src/types/onyx/ReportUpcomingSteps';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

type GetMockUpcomingStepsParams = {
    report: Report;
    policy: OnyxEntry<Policy>;
    rules: OnyxCollection<Rule>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

// TODO: Remove once the backend returns reportUpcomingSteps_. https://github.com/Expensify/App/issues/103160
function getMockUpcomingSteps({report, policy, rules, personalDetails}: GetMockUpcomingStepsParams): ReportUpcomingStep[] {
    const getAccountIDByLogin = (login: string | undefined) => Object.values(personalDetails ?? {}).find((detail) => !!login && detail?.login === login)?.accountID;
    const ownerAccountID = report.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const ownerLogin = getLoginByAccountID(ownerAccountID, personalDetails);
    const approverAccountIDs = getApprovalChain(policy, report, ownerLogin, rules)
        .map(getAccountIDByLogin)
        .filter((accountID): accountID is number => !!accountID);
    const upcomingSteps: ReportUpcomingStep[] = [];

    if (isOpenExpenseReport(report)) {
        upcomingSteps.push({action: CONST.REPORT.UPCOMING_STEP_ACTION.SUBMIT, actorAccountID: ownerAccountID});
        for (const actorAccountID of approverAccountIDs) {
            upcomingSteps.push({action: CONST.REPORT.UPCOMING_STEP_ACTION.APPROVE, actorAccountID});
        }
    } else if (isProcessingReport(report)) {
        const currentApproverIndex = approverAccountIDs.indexOf(report.managerID ?? CONST.DEFAULT_NUMBER_ID);
        const remainingApproverAccountIDs = currentApproverIndex === -1 ? [report.managerID ?? ownerAccountID] : approverAccountIDs.slice(currentApproverIndex);
        for (const actorAccountID of remainingApproverAccountIDs) {
            upcomingSteps.push({action: CONST.REPORT.UPCOMING_STEP_ACTION.APPROVE, actorAccountID});
        }
    }

    if (!isSettled(report)) {
        const payerAccountID = getAccountIDByLogin(policy?.reimburser ?? policy?.achAccount?.reimburser ?? policy?.owner) ?? approverAccountIDs.at(-1) ?? ownerAccountID;
        upcomingSteps.push({action: CONST.REPORT.UPCOMING_STEP_ACTION.PAY, actorAccountID: payerAccountID});
    }

    return upcomingSteps;
}

export default getMockUpcomingSteps;
