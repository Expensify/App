import {delegateEmailSelector} from '@selectors/Account';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';
import AnimatedSubmitButton from '@components/AnimatedSubmitButton';
import {usePaymentAnimationsContext} from '@components/PaymentAnimationsContext';
import {ReportSubmitToPopoverAnchor, useOpenReportSubmitToPopover} from '@components/ReportSubmitToPopoverAnchor';
import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import useConfirmModal from '@hooks/useConfirmModal';
import useConfirmPendingRTERAndProceed from '@hooks/useConfirmPendingRTERAndProceed';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import usePermissions from '@hooks/usePermissions';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useStrictPolicyRules from '@hooks/useStrictPolicyRules';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {search} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {hasDynamicExternalWorkflow, isSubmitPolicy} from '@libs/PolicyUtils';
import {getFilteredReportActionsForReportView} from '@libs/ReportActionsUtils';
import {hasViolations as hasViolationsReportUtils, shouldBlockSubmitDueToPreventSelfApproval, shouldBlockSubmitDueToStrictPolicyRules, shouldShowMarkAsDone} from '@libs/ReportUtils';
import {hasAnyPendingRTERViolation as hasAnyPendingRTERViolationTransactionUtils, hasOnlyPendingCardTransactions, showPendingCardTransactionsBlockModal} from '@libs/TransactionUtils';
import {submitReport} from '@userActions/IOU/ReportWorkflow';
import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';

const ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type SubmitPrimaryActionProps = {
    reportID: string | undefined;
};

function SubmitPrimaryAction({reportID}: SubmitPrimaryActionProps) {
    const {startSubmittingAnimation} = usePaymentAnimationsContext();

    return (
        <ReportSubmitToPopoverAnchor
            reportID={reportID}
            onSubmitSuccess={startSubmittingAnimation}
            anchorAlignment={ANCHOR_ALIGNMENT}
        >
            <SubmitPrimaryActionContent reportID={reportID} />
        </ReportSubmitToPopoverAnchor>
    );
}

function SubmitPrimaryActionContent({reportID}: SubmitPrimaryActionProps) {
    const {isSubmittingAnimationRunning, stopAnimation, startSubmittingAnimation} = usePaymentAnimationsContext();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const {areStrictPolicyRulesEnabled} = useStrictPolicyRules();
    const openReportSubmitToPopover = useOpenReportSubmitToPopover();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [submitterLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(moneyRequestReport?.ownerAccountID)});
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(moneyRequestReport?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
    const {transactions: reportTransactions, violations} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactions);
    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, allTransactionViolations, accountID, email ?? '');
    const hasAnyPendingRTERViolation = hasAnyPendingRTERViolationTransactionUtils(transactions, allTransactionViolations, email ?? '', accountID, moneyRequestReport, policy);
    const isDEWSubmission = hasDynamicExternalWorkflow(policy);

    const handleMarkPendingRTERTransactionsAsCash = () => {
        markPendingRTERTransactionsAsCash(transactions, allTransactionViolations, reportActions);
    };
    const confirmPendingRTERAndProceed = useConfirmPendingRTERAndProceed(hasAnyPendingRTERViolation, handleMarkPendingRTERTransactionsAsCash);

    const {showConfirmModal} = useConfirmModal();

    const isBlockSubmitDueToPreventSelfApproval = shouldBlockSubmitDueToPreventSelfApproval(moneyRequestReport, policy);
    const isBlockSubmitDueToStrictPolicyRules = shouldBlockSubmitDueToStrictPolicyRules(
        moneyRequestReport?.reportID,
        violations,
        areStrictPolicyRulesEnabled,
        accountID,
        email ?? '',
        transactions,
    );
    const shouldBlockSubmit = isBlockSubmitDueToStrictPolicyRules || isBlockSubmitDueToPreventSelfApproval;
    const shouldUseMarkAsDoneCopy = shouldShowMarkAsDone({
        policy,
        report: moneyRequestReport,
        isTrackIntentUser,
    });

    const {currentSearchQueryJSON, currentSearchKey} = useSearchQueryContext();
    const {currentSearchResults} = useSearchResultsContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);

    const handleSubmit = () => {
        if (!moneyRequestReport || shouldBlockSubmit) {
            return;
        }

        if (hasOnlyPendingCardTransactions(transactions)) {
            showPendingCardTransactionsBlockModal(showConfirmModal, translate);
            return;
        }

        confirmPendingRTERAndProceed(() => {
            if (isSubmitPolicy(policy) && reportID) {
                openReportSubmitToPopover();
                return;
            }

            submitReport({
                expenseReport: moneyRequestReport,
                policy,
                currentUserAccountIDParam: accountID,
                currentUserEmailParam: email ?? '',
                hasViolations,
                isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: nextStep,
                userBillingGracePeriodEnds,
                amountOwed,
                onSubmitted: startSubmittingAnimation,
                ownerBillingGracePeriodEnd,
                delegateEmail,
                submitterLogin,
            });
            if (currentSearchQueryJSON && !isOffline) {
                search({
                    searchKey: currentSearchKey,
                    shouldCalculateTotals,
                    offset: 0,
                    queryJSON: currentSearchQueryJSON,
                    isOffline,
                    isLoading: !!currentSearchResults?.search?.isLoading,
                });
            }
        });
    };

    return (
        <AnimatedSubmitButton
            success
            text={shouldUseMarkAsDoneCopy ? translate('common.markAsDone') : translate('common.submit')}
            isMarkAsDone={shouldUseMarkAsDoneCopy}
            onPress={handleSubmit}
            isSubmittingAnimationRunning={isSubmittingAnimationRunning}
            onAnimationFinish={stopAnimation}
            isDisabled={shouldBlockSubmit}
            isDEWSubmission={isDEWSubmission}
            reportID={reportID}
        />
    );
}

export default SubmitPrimaryAction;
