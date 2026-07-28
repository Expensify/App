import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {buildOptimisticFixIssueNextStep, getReportNextStep} from '@libs/NextStepUtils';
import {hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {getFilteredReportActionsForReportView, hasPendingDEWApprove, hasPendingDEWSubmit} from '@libs/ReportActionsUtils';
import {
    getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    getReasonAndReportActionThatRequiresAttention,
    isOpenExpenseReport,
    isReportOwner,
    shouldBlockSubmitDueToStrictPolicyRules,
} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import type * as OnyxTypes from '@src/types/onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePaginatedReportActions from './usePaginatedReportActions';
import useReportIsArchived from './useReportIsArchived';
import useStrictPolicyRules from './useStrictPolicyRules';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

function useOptimisticNextStep(reportID: string | undefined) {
    const {accountID, email, login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {areStrictPolicyRulesEnabled} = useStrictPolicyRules();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [ownerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(moneyRequestReport?.ownerAccountID)});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(moneyRequestReport?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const {transactions: reportTransactions, violations} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactions);

    const isArchivedReport = useReportIsArchived(moneyRequestReport?.reportID);
    const isDEWPolicy = hasDynamicExternalWorkflow(policy);

    const isBlockSubmitDueToStrictPolicyRules = shouldBlockSubmitDueToStrictPolicyRules(
        moneyRequestReport?.reportID,
        violations,
        areStrictPolicyRulesEnabled,
        accountID,
        email ?? '',
        transactions,
    );

    let optimisticNextStep = getReportNextStep(moneyRequestReport?.nextStep, moneyRequestReport, ownerLogin, transactions, policy, allTransactionViolations, email ?? '', accountID);

    if (isDEWPolicy && (moneyRequestReport?.statusNum === CONST.REPORT.STATUS_NUM.OPEN || moneyRequestReport?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED)) {
        if (moneyRequestReport?.statusNum === CONST.REPORT.STATUS_NUM.OPEN) {
            const reportActionsObject = reportActions.reduce<OnyxTypes.ReportActions>((acc, action) => {
                if (action.reportActionID) {
                    acc[action.reportActionID] = action;
                }
                return acc;
            }, {});
            const {errors} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(moneyRequestReport, reportActionsObject, reportTransactions);

            if (errors?.dewSubmitFailed) {
                optimisticNextStep = buildOptimisticFixIssueNextStep(moneyRequestReport?.ownerAccountID ?? CONST.DEFAULT_MISSING_ID);
            }
        } else if (moneyRequestReport?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED) {
            const gbrResult = getReasonAndReportActionThatRequiresAttention(moneyRequestReport, currentUserLogin ?? '', accountID, undefined, isArchivedReport);
            const hasDEWApproveFailed = gbrResult?.reason === CONST.REQUIRES_ATTENTION_REASONS.HAS_DEW_APPROVE_FAILED;
            const isCurrentUserTheApprover = moneyRequestReport?.managerID === accountID;
            if (hasDEWApproveFailed && isCurrentUserTheApprover) {
                optimisticNextStep = buildOptimisticFixIssueNextStep(moneyRequestReport?.ownerAccountID ?? CONST.DEFAULT_MISSING_ID);
            }
        }
    }

    if (isBlockSubmitDueToStrictPolicyRules && isReportOwner(moneyRequestReport) && isOpenExpenseReport(moneyRequestReport)) {
        optimisticNextStep = buildOptimisticFixIssueNextStep(moneyRequestReport?.ownerAccountID ?? CONST.DEFAULT_MISSING_ID);
    }

    return optimisticNextStep;
}

export default useOptimisticNextStep;
