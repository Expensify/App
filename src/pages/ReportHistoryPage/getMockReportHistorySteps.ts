import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import {isActionOfType, isApprovedAction, isForwardedAction, isHoldAction, isPayAction, isSubmittedAction} from '@libs/ReportActionsUtils';
import {getApprovalChain, isOpenExpenseReport, isProcessingReport, isSettled} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {PersonalDetailsList, Policy, Report, ReportAction, ReportActions, Rule} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import type {ReportHistoryAction, ReportHistoryStep} from './types';

import {REPORT_HISTORY_ACTION} from './types';

type GetMockReportHistoryStepsParams = {
    report: Report;
    policy: OnyxEntry<Policy>;
    rules: OnyxCollection<Rule>;
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** The expense report's own actions */
    reportActions: OnyxEntry<ReportActions>;

    /** One entry per held expense. Undefined when the expense's thread hasn't been loaded yet */
    holdActions: Array<OnyxEntry<ReportAction>>;
};

function getPastAction(reportAction: ReportAction): ReportHistoryAction | undefined {
    if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CREATED)) {
        return REPORT_HISTORY_ACTION.CREATED;
    }
    if (isSubmittedAction(reportAction)) {
        return REPORT_HISTORY_ACTION.SUBMITTED;
    }
    if (isApprovedAction(reportAction) || isForwardedAction(reportAction)) {
        return REPORT_HISTORY_ACTION.APPROVED;
    }
    if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REROUTE)) {
        return REPORT_HISTORY_ACTION.REROUTED;
    }
    if (isPayAction(reportAction) || isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REIMBURSED) || isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED)) {
        return REPORT_HISTORY_ACTION.PAID;
    }
    return undefined;
}

// TODO: Remove once the backend returns report history. https://github.com/Expensify/App/issues/103160
function getMockReportHistorySteps({report, policy, rules, personalDetails, reportActions, holdActions}: GetMockReportHistoryStepsParams): ReportHistoryStep[] {
    const getAccountIDByLogin = (login: string | undefined) => Object.values(personalDetails ?? {}).find((detail) => !!login && detail?.login === login)?.accountID;
    const ownerAccountID = report.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const pastSteps: ReportHistoryStep[] = [];
    for (const reportAction of Object.values(reportActions ?? {})) {
        const action = getPastAction(reportAction);
        if (!action || reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        pastSteps.push({action, accountID: reportAction.actorAccountID ?? ownerAccountID, created: reportAction.created, isCompleted: true});
    }
    for (const holdAction of holdActions) {
        pastSteps.push({
            action: REPORT_HISTORY_ACTION.HELD,
            accountID: (isHoldAction(holdAction) ? holdAction.actorAccountID : undefined) ?? report.managerID ?? ownerAccountID,
            created: (isHoldAction(holdAction) ? holdAction.created : undefined) ?? report.lastVisibleActionCreated,
            isCompleted: true,
        });
    }
    pastSteps.sort((a, b) => ((a.created ?? '') < (b.created ?? '') ? -1 : 1));

    const ownerLogin = getLoginByAccountID(ownerAccountID, personalDetails);
    const approverAccountIDs = getApprovalChain(policy, report, ownerLogin, rules)
        .map(getAccountIDByLogin)
        .filter((accountID): accountID is number => !!accountID);
    const upcomingSteps: ReportHistoryStep[] = [];

    if (isOpenExpenseReport(report)) {
        upcomingSteps.push({action: REPORT_HISTORY_ACTION.SUBMITTED, accountID: ownerAccountID, isCompleted: false});
        for (const accountID of approverAccountIDs) {
            upcomingSteps.push({action: REPORT_HISTORY_ACTION.APPROVED, accountID, isCompleted: false});
        }
    } else if (isProcessingReport(report)) {
        const currentApproverIndex = approverAccountIDs.indexOf(report.managerID ?? CONST.DEFAULT_NUMBER_ID);
        const remainingApproverAccountIDs = currentApproverIndex === -1 ? [report.managerID ?? ownerAccountID] : approverAccountIDs.slice(currentApproverIndex);
        for (const accountID of remainingApproverAccountIDs) {
            upcomingSteps.push({action: REPORT_HISTORY_ACTION.APPROVED, accountID, isCompleted: false});
        }
    }

    if (!isSettled(report)) {
        const payerAccountID = getAccountIDByLogin(policy?.reimburser ?? policy?.achAccount?.reimburser ?? policy?.owner) ?? approverAccountIDs.at(-1) ?? ownerAccountID;
        upcomingSteps.push({action: REPORT_HISTORY_ACTION.PAID, accountID: payerAccountID, isCompleted: false});
    }

    return [...pastSteps, ...upcomingSteps];
}

export default getMockReportHistorySteps;
