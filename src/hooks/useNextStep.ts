import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {buildOptimisticFixIssueNextStep, shouldShowDynamicExternalWorkflowApproveErrorNextStep, getReportNextStep} from '@libs/NextStepUtils';
import {hasDynamicExternalWorkflow, isArchivedPolicy} from '@libs/PolicyUtils';
import {getFilteredReportActionsForReportView} from '@libs/ReportActionsUtils';
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

import {loginSelector} from '@selectors/PersonalDetails';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePaginatedReportActions from './usePaginatedReportActions';
import {usePersonalDetail} from './usePersonalDetails';
import useReportIsArchived from './useReportIsArchived';
import useStrictPolicyRules from './useStrictPolicyRules';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

function useNextStep(reportID: string | undefined) {
    const {accountID, email, login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {areStrictPolicyRulesEnabled} = useStrictPolicyRules();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [ownerLogin] = usePersonalDetail(report?.ownerAccountID, loginSelector);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(report?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const {transactions, violations} = useTransactionsAndViolationsForReport(report?.reportID);

    const isArchivedReport = useReportIsArchived(report?.reportID);

    let optimisticNextStep = getReportNextStep({
        report,
        policy,
        transactions,
        violations,
        currentUserEmail: email ?? '',
        currentUserAccountID: accountID,
        rules,
    });

    return optimisticNextStep;
}

export default useNextStep;
