import AnimatedSubmitButton from '@components/AnimatedSubmitButton';
import {ReportSubmitToPopoverAnchor, useOpenReportSubmitToPopover} from '@components/ReportSubmitToPopoverAnchor';

import useConfirmModal from '@hooks/useConfirmModal';
import useConfirmPendingRTERAndProceed from '@hooks/useConfirmPendingRTERAndProceed';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {hasDynamicExternalWorkflow, isSubmitPolicy} from '@libs/PolicyUtils';
import {hasOnlyHeldExpenses, hasViolations as hasViolationsReportUtils, shouldShowMarkAsDone} from '@libs/ReportUtils';
import {
    hasAnyPendingRTERViolation as hasAnyPendingRTERViolationTransactionUtils,
    hasOnlyPendingCardTransactions,
    showHeldExpensesBlockModal,
    showPendingCardTransactionsBlockModal,
} from '@libs/TransactionUtils';

import {submitReport} from '@userActions/IOU/ReportWorkflow';
import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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

    const shouldShowMarkAsDoneCopy = shouldShowMarkAsDone({
        isTrackIntentUser,
        report: iouReport,
        policy,
    });

    const handleSubmit = () => {
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
            sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.SUBMIT_BUTTON}
            isDEWSubmission={isDEWSubmission}
            reportID={iouReportID}
        />
    );
}

export default SubmitActionButton;
