import AnimatedSubmitButton from '@components/AnimatedSubmitButton';
import {ReportSubmitToPopoverAnchor, useOpenReportSubmitToPopover} from '@components/ReportSubmitToPopoverAnchor';

import useConfirmModal from '@hooks/useConfirmModal';
import useConfirmPendingRTERAndProceed from '@hooks/useConfirmPendingRTERAndProceed';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useReportTransactionViolations from '@hooks/useReportTransactionViolations';

import {hasDynamicExternalWorkflow, isSubmitPolicy} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils, shouldShowMarkAsDone} from '@libs/ReportUtils';
import {hasAnyPendingRTERViolation as hasAnyPendingRTERViolationTransactionUtils, hasOnlyPendingCardTransactions, showPendingCardTransactionsBlockModal} from '@libs/TransactionUtils';

import {submitReport} from '@userActions/IOU/ReportWorkflow';
import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';

import {useReportPreviewActions, useReportPreviewAnimationState, useReportPreviewData} from './MoneyRequestReportPreviewContext';
import useReportPreviewActionButtonData from './useReportPreviewActionButtonData';
import useReportPreviewFilteredTransactions from './useReportPreviewFilteredTransactions';

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
    const {showConfirmModal} = useConfirmModal();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const {isBetaEnabled} = usePermissions();
    const openReportSubmitToPopover = useOpenReportSubmitToPopover();

    const {iouReportID} = useReportPreviewData();
    const {isSubmittingAnimationRunning} = useReportPreviewAnimationState();
    const {stopAnimation, startSubmittingAnimation} = useReportPreviewActions();

    const {
        iouReport,
        policy,
        ownerLogin: submitterLogin,
        userBillingGracePeriodEnds,
        iouReportNextStep,
        amountOwed,
        ownerBillingGracePeriodEnd,
        delegateEmail,
    } = useReportPreviewActionButtonData(iouReportID);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const transactions = useReportPreviewFilteredTransactions(iouReportID);

    const [transactionViolations] = useReportTransactionViolations(transactions);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(iouReport?.reportID, transactionViolations, currentUserAccountID, currentUserEmail, undefined, transactions);
    const hasAnyPendingRTERViolation = hasAnyPendingRTERViolationTransactionUtils(transactions, transactionViolations, currentUserEmail, currentUserAccountID, iouReport, policy);
    const isDEWSubmission = hasDynamicExternalWorkflow(policy);

    const handleMarkPendingRTERTransactionsAsCash = () => {
        markPendingRTERTransactionsAsCash(transactions, transactionViolations, Object.values(reportActions ?? {}));
    };

    const confirmPendingRTERAndProceed = useConfirmPendingRTERAndProceed(hasAnyPendingRTERViolation, handleMarkPendingRTERTransactionsAsCash);

    const handleSubmit = () => {
        if (hasOnlyPendingCardTransactions(transactions)) {
            showPendingCardTransactionsBlockModal(showConfirmModal, translate);
            return;
        }

        confirmPendingRTERAndProceed(() => {
            if (isSubmitPolicy(policy) && iouReportID) {
                openReportSubmitToPopover();
                return;
            }

            submitReport({
                expenseReport: iouReport,
                policy,
                currentUserAccountIDParam: currentUserAccountID,
                currentUserEmailParam: currentUserEmail,
                hasViolations,
                isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: iouReportNextStep,
                userBillingGracePeriodEnds,
                amountOwed,
                onSubmitted: startSubmittingAnimation,
                ownerBillingGracePeriodEnd,
                delegateEmail,
                submitterLogin,
            });
        });
    };

    const shouldUseMarkAsDoneCopy = shouldShowMarkAsDone({
        isTrackIntentUser,
        report: iouReport,
        policy,
    });

    return (
        <AnimatedSubmitButton
            success
            text={shouldUseMarkAsDoneCopy ? translate('common.markAsDone') : translate('common.submit')}
            isMarkAsDone={shouldUseMarkAsDoneCopy}
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
