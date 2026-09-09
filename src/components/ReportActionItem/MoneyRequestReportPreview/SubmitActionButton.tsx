import AnimatedSubmitButton from '@components/AnimatedSubmitButton';
import {ReportSubmitToPopoverAnchor, useOpenReportSubmitToPopover} from '@components/ReportSubmitToPopoverAnchor';

import useConfirmModal from '@hooks/useConfirmModal';
import useConfirmPendingRTERAndProceed from '@hooks/useConfirmPendingRTERAndProceed';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useStrictPolicyRules from '@hooks/useStrictPolicyRules';

import {hasDynamicExternalWorkflow, isSubmitPolicy} from '@libs/PolicyUtils';
import {
    hasOnlyHeldExpenses,
    hasViolations as hasViolationsReportUtils,
    shouldBlockSubmitDueToPreventSelfApproval,
    shouldBlockSubmitDueToStrictPolicyRules,
    shouldShowMarkAsDone,
} from '@libs/ReportUtils';
import {
    getTransactionViolations,
    hasAnyPendingRTERViolation as hasAnyPendingRTERViolationTransactionUtils,
    hasOnlyPendingCardTransactions,
    showHeldExpensesBlockModal,
    showPendingCardTransactionsBlockModal,
} from '@libs/TransactionUtils';

import {submitReport} from '@userActions/IOU/ReportWorkflow';
import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';

import {useReportPreviewActions, useReportPreviewAnimationState, useReportPreviewData, useReportPreviewTransactionViolations} from './MoneyRequestReportPreviewContext';
import useReportPreviewActionButtonData from './useReportPreviewActionButtonData';

const ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

function SubmitActionButton() {
    const {iouReportID} = useReportPreviewData();
    const {startSubmittingAnimation} = useReportPreviewActions();
    return (
        <ReportSubmitToPopoverAnchor
            reportID={iouReportID}
            onSubmitSuccess={startSubmittingAnimation}
            anchorAlignment={ANCHOR_ALIGNMENT}
        >
            <SubmitActionButtonContent />
        </ReportSubmitToPopoverAnchor>
    );
}

function SubmitActionButtonContent() {
    const {translate} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {showConfirmModal} = useConfirmModal();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const {isBetaEnabled} = usePermissions();
    const {areStrictPolicyRulesEnabled} = useStrictPolicyRules();
    const openReportSubmitToPopover = useOpenReportSubmitToPopover();

    const {iouReportID, transactions} = useReportPreviewData();
    const {isSubmittingAnimationRunning} = useReportPreviewAnimationState();
    const {stopAnimation, startSubmittingAnimation} = useReportPreviewActions();

    const {
        iouReport,
        policy,
        ownerLogin: submitterLogin,
        userBillingGracePeriodEnds,
        amountOwed,
        ownerBillingGracePeriodEnd,
        delegateEmail,
        delegateAccountID,
    } = useReportPreviewActionButtonData(iouReportID);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const {transactionViolations} = useReportPreviewTransactionViolations();

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(iouReport?.reportID, transactionViolations, currentUserAccountID, currentUserEmail, undefined, transactions);
    const hasAnyPendingRTERViolation = hasAnyPendingRTERViolationTransactionUtils(
        transactions,
        transactionViolations,
        currentUserEmail,
        currentUserAccountID,
        iouReport,
        submitterLogin,
        policy,
    );
    const isDEWSubmission = hasDynamicExternalWorkflow(policy);

    const handleMarkPendingRTERTransactionsAsCash = () => {
        markPendingRTERTransactionsAsCash(transactions, transactionViolations, Object.values(reportActions ?? {}));
    };

    const confirmPendingRTERAndProceed = useConfirmPendingRTERAndProceed(hasAnyPendingRTERViolation, handleMarkPendingRTERTransactionsAsCash);

    // The header's gate receives violations pre-filtered by useTransactionsAndViolationsForReport, which drops dismissals
    // that are only detectable with report/owner/policy context (e.g. RTER violations dismissed under instant submit). The
    // preview context exposes the raw slice, so apply the same filter here or the two Submit buttons disagree on dismissed
    // violations. This stays a pure computation over data already in scope; calling the hook instead would duplicate its
    // Onyx subscriptions for every preview on screen.
    const filteredTransactionViolations: Record<string, TransactionViolations> = {};
    for (const transactionViolationKey of Object.keys(transactionViolations ?? {})) {
        const transactionID = transactionViolationKey.split('_').at(1) ?? '';
        const transaction = transactions.find((reportTransaction) => reportTransaction.transactionID === transactionID);
        filteredTransactionViolations[transactionViolationKey] =
            getTransactionViolations(transaction, transactionViolations, currentUserEmail, currentUserAccountID, iouReport, submitterLogin, policy) ?? [];
    }

    const isBlockSubmitDueToPreventSelfApproval = shouldBlockSubmitDueToPreventSelfApproval(iouReport, policy);
    const isBlockSubmitDueToStrictPolicyRules = shouldBlockSubmitDueToStrictPolicyRules(
        iouReport?.reportID,
        filteredTransactionViolations,
        areStrictPolicyRulesEnabled,
        currentUserAccountID,
        currentUserEmail,
        transactions,
    );
    const shouldBlockSubmit = isBlockSubmitDueToStrictPolicyRules || isBlockSubmitDueToPreventSelfApproval;

    const shouldShowMarkAsDoneCopy = shouldShowMarkAsDone({
        isTrackIntentUser,
        report: iouReport,
        policy,
    });

    const handleSubmit = () => {
        // A domain that strictly enforces workspace rules, or a workspace that prevents self-approval, makes the backend
        // reject this submission, which the user only ever sees as a generic "Unexpected error". Bail out before any API
        // call. The button is disabled on the same condition, so this is the second layer, and it has to run before the
        // submit-to popover branch below, which would otherwise run the submission itself and hit the same rejection.
        if (shouldBlockSubmit) {
            return;
        }

        if (hasOnlyPendingCardTransactions(transactions)) {
            showPendingCardTransactionsBlockModal(showConfirmModal, translate, shouldShowMarkAsDoneCopy);
            return;
        }

        if (hasOnlyHeldExpenses(transactions)) {
            showHeldExpensesBlockModal(showConfirmModal, translate, shouldShowMarkAsDoneCopy);
            return;
        }

        confirmPendingRTERAndProceed(() => {
            if (isSubmitPolicy(policy) && iouReportID) {
                openReportSubmitToPopover();
                return;
            }

            submitReport({
                getCurrencyDecimals,
                expenseReport: iouReport,
                policy,
                currentUserAccountIDParam: currentUserAccountID,
                currentUserEmailParam: currentUserEmail,
                hasViolations,
                isASAPSubmitBetaEnabled,
                betas,
                userBillingGracePeriodEnds,
                amountOwed,
                onSubmitted: startSubmittingAnimation,
                ownerBillingGracePeriodEnd,
                delegateEmail,
                delegateAccountID,
                submitterLogin,
                isTrackIntentUser,
            });
        });
    };

    return (
        <AnimatedSubmitButton
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            text={shouldShowMarkAsDoneCopy ? translate('common.markAsDone') : translate('common.submit')}
            shouldShowMarkAsDoneCopy={shouldShowMarkAsDoneCopy}
            onPress={handleSubmit}
            isSubmittingAnimationRunning={isSubmittingAnimationRunning}
            onAnimationFinish={stopAnimation}
            isDisabled={shouldBlockSubmit}
            sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.SUBMIT_BUTTON}
            isDEWSubmission={isDEWSubmission}
            reportID={iouReportID}
        />
    );
}

export default SubmitActionButton;
