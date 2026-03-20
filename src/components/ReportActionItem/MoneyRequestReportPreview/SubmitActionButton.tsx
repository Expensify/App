import React from 'react';
import AnimatedSubmitButton from '@components/AnimatedSubmitButton';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {canSubmitAndIsAwaitingForCurrentUser, getReportTransactions, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {submitReport} from '@userActions/IOU';
import {openOldDotLink} from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type SubmitActionButtonProps = {
    iouReportID: string | undefined;
    chatReportID: string | undefined;
    isSubmittingAnimationRunning: boolean;
    stopAnimation: () => void;
    startSubmittingAnimation: () => void;
};

function SubmitActionButton({iouReportID, chatReportID, isSubmittingAnimationRunning, stopAnimation, startSubmittingAnimation}: SubmitActionButtonProps) {
    const {translate} = useLocalize();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const {isBetaEnabled} = usePermissions();
    const {showConfirmModal} = useConfirmModal();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`);
    const [userBillingGraceEndPeriods] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [iouReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReportID}`);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`);
    const {isOffline} = useNetwork();
    const transactions = getReportTransactions(iouReportID).filter((t) => isOffline || t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const isDEWBetaEnabled = isBetaEnabled(CONST.BETAS.NEW_DOT_DEW);
    const hasViolations = hasViolationsReportUtils(iouReport?.reportID, transactionViolations, currentUserAccountID, currentUserEmail);

    const isWaitingForSubmissionFromCurrentUser = canSubmitAndIsAwaitingForCurrentUser(
        iouReport,
        chatReport,
        policy,
        transactions,
        transactionViolations,
        currentUserEmail,
        currentUserAccountID,
        reportActions,
    );

    return (
        <AnimatedSubmitButton
            success={isWaitingForSubmissionFromCurrentUser}
            text={translate('common.submit')}
            onPress={() => {
                if (hasDynamicExternalWorkflow(policy) && !isDEWBetaEnabled) {
                    showConfirmModal({
                        title: translate('customApprovalWorkflow.title'),
                        prompt: translate('customApprovalWorkflow.description'),
                        confirmText: translate('customApprovalWorkflow.goToExpensifyClassic'),
                        shouldShowCancelButton: false,
                    }).then((result) => {
                        if (result.action !== ModalActions.CONFIRM) {
                            return;
                        }
                        openOldDotLink(CONST.OLDDOT_URLS.INBOX);
                    });
                    return;
                }
                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
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
                    userBillingGraceEndPeriods,
                    amountOwed,
                    onSubmitted: startSubmittingAnimation,
                });
            }}
            isSubmittingAnimationRunning={isSubmittingAnimationRunning}
            onAnimationFinish={stopAnimation}
            sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.SUBMIT_BUTTON}
        />
    );
}

export default SubmitActionButton;
