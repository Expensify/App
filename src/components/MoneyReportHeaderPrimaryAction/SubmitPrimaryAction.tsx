import React from 'react';
import AnimatedSubmitButton from '@components/AnimatedSubmitButton';
import useConfirmPendingRTERAndProceed from '@hooks/useConfirmPendingRTERAndProceed';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useStrictPolicyRules from '@hooks/useStrictPolicyRules';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getFilteredReportActionsForReportView} from '@libs/ReportActionsUtils';
import {getNextApproverAccountID, isReportOwner, shouldBlockSubmitDueToStrictPolicyRules} from '@libs/ReportUtils';
import {hasAnyPendingRTERViolation as hasAnyPendingRTERViolationTransactionUtils} from '@libs/TransactionUtils';
import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type SubmitPrimaryActionProps = {
    reportID: string | undefined;
    isSubmittingAnimationRunning: boolean;
    stopAnimation: () => void;
    startSubmittingAnimation: () => void;
};

function SubmitPrimaryAction({reportID, isSubmittingAnimationRunning, stopAnimation, startSubmittingAnimation}: SubmitPrimaryActionProps) {
    const {translate} = useLocalize();
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {areStrictPolicyRulesEnabled} = useStrictPolicyRules();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(moneyRequestReport?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
    const {transactions: reportTransactions, violations} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactions);
    const hasAnyPendingRTERViolation = hasAnyPendingRTERViolationTransactionUtils(transactions, allTransactionViolations, email ?? '', accountID, moneyRequestReport, policy);

    const handleMarkPendingRTERTransactionsAsCash = () => {
        markPendingRTERTransactionsAsCash(transactions, allTransactionViolations, reportActions);
    };
    const confirmPendingRTERAndProceed = useConfirmPendingRTERAndProceed(hasAnyPendingRTERViolation, handleMarkPendingRTERTransactionsAsCash);

    const nextApproverAccountID = getNextApproverAccountID(moneyRequestReport);
    const isSubmitterSameAsNextApprover =
        isReportOwner(moneyRequestReport) && (nextApproverAccountID === moneyRequestReport?.ownerAccountID || moneyRequestReport?.managerID === moneyRequestReport?.ownerAccountID);
    const isBlockSubmitDueToPreventSelfApproval = isSubmitterSameAsNextApprover && policy?.preventSelfApproval;
    const isBlockSubmitDueToStrictPolicyRules = shouldBlockSubmitDueToStrictPolicyRules(
        moneyRequestReport?.reportID,
        violations,
        areStrictPolicyRulesEnabled,
        accountID,
        email ?? '',
        transactions,
    );
    const shouldBlockSubmit = isBlockSubmitDueToStrictPolicyRules || isBlockSubmitDueToPreventSelfApproval;

    const handleSubmit = () => {
        if (!moneyRequestReport || shouldBlockSubmit || !reportID) {
            return;
        }
        confirmPendingRTERAndProceed(() => {
            Navigation.navigate(ROUTES.REPORT_SUBMIT_TO.getRoute(reportID, Navigation.getActiveRoute()));
        });
    };

    return (
        <AnimatedSubmitButton
            success
            text={translate('common.submit')}
            onPress={handleSubmit}
            isSubmittingAnimationRunning={isSubmittingAnimationRunning}
            onAnimationFinish={stopAnimation}
            isDisabled={shouldBlockSubmit}
        />
    );
}

export default SubmitPrimaryAction;
