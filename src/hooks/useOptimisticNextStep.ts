import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    buildOptimisticNextStepForDEWOffline,
    buildOptimisticNextStepForDynamicExternalWorkflowApproveError,
    buildOptimisticNextStepForDynamicExternalWorkflowSubmitError,
    buildOptimisticNextStepForStrictPolicyRuleViolations,
    getReportNextStep,
} from '@libs/NextStepUtils';
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
import type * as OnyxTypes from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePaginatedReportActions from './usePaginatedReportActions';
import useReportIsArchived from './useReportIsArchived';
import useStrictPolicyRules from './useStrictPolicyRules';
import useTheme from './useTheme';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

function useOptimisticNextStep(reportID: string | undefined) {
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {areStrictPolicyRulesEnabled} = useStrictPolicyRules();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${moneyRequestReport?.reportID}`);
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

    let optimisticNextStep = getReportNextStep(nextStep, moneyRequestReport, transactions, policy, allTransactionViolations, email ?? '', accountID);

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
                optimisticNextStep = buildOptimisticNextStepForDynamicExternalWorkflowSubmitError(theme.danger);
            } else if (isOffline && hasPendingDEWSubmit(reportMetadata, isDEWPolicy)) {
                optimisticNextStep = buildOptimisticNextStepForDEWOffline();
            }
        } else if (moneyRequestReport?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED) {
            const gbrResult = getReasonAndReportActionThatRequiresAttention(moneyRequestReport, undefined, isArchivedReport);
            const hasDEWApproveFailed = gbrResult?.reason === CONST.REQUIRES_ATTENTION_REASONS.HAS_DEW_APPROVE_FAILED;
            const isCurrentUserTheApprover = moneyRequestReport?.managerID === accountID;
            if (hasDEWApproveFailed && isCurrentUserTheApprover) {
                optimisticNextStep = buildOptimisticNextStepForDynamicExternalWorkflowApproveError(theme.danger);
            } else if (isOffline && hasPendingDEWApprove(reportMetadata, isDEWPolicy)) {
                optimisticNextStep = buildOptimisticNextStepForDEWOffline();
            }
        }
    }

    if (isBlockSubmitDueToStrictPolicyRules && isReportOwner(moneyRequestReport) && isOpenExpenseReport(moneyRequestReport)) {
        optimisticNextStep = buildOptimisticNextStepForStrictPolicyRuleViolations();
    }

    return optimisticNextStep;
}

export default useOptimisticNextStep;
