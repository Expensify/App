import {delegateEmailSelector} from '@selectors/Account';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import AnimatedSubmitButton from '@components/AnimatedSubmitButton';
import {ReportSubmitToPopoverAnchor, useOpenReportSubmitToPopover} from '@components/ReportSubmitToPopoverAnchor';
import useConfirmModal from '@hooks/useConfirmModal';
import useConfirmPendingRTERAndProceed from '@hooks/useConfirmPendingRTERAndProceed';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import {isSubmitPolicy} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils, shouldShowMarkAsDone} from '@libs/ReportUtils';
import {hasAnyPendingRTERViolation as hasAnyPendingRTERViolationTransactionUtils, hasOnlyPendingCardTransactions, showPendingCardTransactionsBlockModal} from '@libs/TransactionUtils';
import {submitReport} from '@userActions/IOU/ReportWorkflow';
import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type TransactionViolations from '@src/types/onyx/TransactionViolation';

type SubmitActionButtonContentProps = {
    iouReportID: string | undefined;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    policy: OnyxEntry<OnyxTypes.Policy>;
    userBillingGracePeriodEnds: OnyxCollection<OnyxTypes.BillingGraceEndPeriod>;
    iouReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    amountOwed: OnyxEntry<number>;
    ownerBillingGracePeriodEnd: OnyxEntry<number>;
    transactionViolations: OnyxCollection<TransactionViolations>;
    reportActions: OnyxEntry<OnyxTypes.ReportActions>;
    transactions: OnyxTypes.Transaction[];
    currentUserAccountID: number;
    currentUserEmail: string;
    delegateEmail: string | undefined;
    isASAPSubmitBetaEnabled: boolean;
    hasViolations: boolean;
    hasAnyPendingRTERViolation: boolean;
    isSubmittingAnimationRunning: boolean;
    stopAnimation: () => void;
    startSubmittingAnimation: () => void;
    isTrackIntentUser: boolean;
};

function SubmitActionButtonContent({
    iouReportID,
    iouReport,
    policy,
    userBillingGracePeriodEnds,
    iouReportNextStep,
    amountOwed,
    ownerBillingGracePeriodEnd,
    transactionViolations,
    reportActions,
    transactions,
    currentUserAccountID,
    currentUserEmail,
    delegateEmail,
    isASAPSubmitBetaEnabled,
    hasViolations,
    hasAnyPendingRTERViolation,
    isSubmittingAnimationRunning,
    stopAnimation,
    startSubmittingAnimation,
    isTrackIntentUser,
}: SubmitActionButtonContentProps) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const openReportSubmitToPopover = useOpenReportSubmitToPopover();

    const handleMarkPendingRTERTransactionsAsCash = () => {
        markPendingRTERTransactionsAsCash(transactions, transactionViolations, Object.values(reportActions ?? {}));
    };

    const confirmPendingRTERAndProceed = useConfirmPendingRTERAndProceed(hasAnyPendingRTERViolation, handleMarkPendingRTERTransactionsAsCash);
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
            onPress={() => {
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
                    });
                });
            }}
            isSubmittingAnimationRunning={isSubmittingAnimationRunning}
            onAnimationFinish={stopAnimation}
            sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.SUBMIT_BUTTON}
        />
    );
}

type SubmitActionButtonProps = {
    iouReportID: string | undefined;
    isSubmittingAnimationRunning: boolean;
    stopAnimation: () => void;
    startSubmittingAnimation: () => void;
};

function SubmitActionButton({iouReportID, isSubmittingAnimationRunning, stopAnimation, startSubmittingAnimation}: SubmitActionButtonProps) {
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const {isBetaEnabled} = usePermissions();

    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [iouReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReportID}`);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const {isOffline} = useNetwork();
    const reportTransactionsCollection = useReportTransactionsCollection(iouReportID);
    const transactions = Object.values(reportTransactionsCollection ?? {}).filter(
        (t): t is OnyxTypes.Transaction => !!t && (isOffline || t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
    );

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(iouReport?.reportID, transactionViolations, currentUserAccountID, currentUserEmail);
    const hasAnyPendingRTERViolation = hasAnyPendingRTERViolationTransactionUtils(transactions, transactionViolations, currentUserEmail, currentUserAccountID, iouReport, policy);

    return (
        <ReportSubmitToPopoverAnchor
            reportID={iouReportID}
            onSubmitSuccess={startSubmittingAnimation}
        >
            <SubmitActionButtonContent
                iouReportID={iouReportID}
                iouReport={iouReport}
                policy={policy}
                userBillingGracePeriodEnds={userBillingGracePeriodEnds}
                iouReportNextStep={iouReportNextStep}
                amountOwed={amountOwed}
                ownerBillingGracePeriodEnd={ownerBillingGracePeriodEnd}
                transactionViolations={transactionViolations}
                reportActions={reportActions}
                transactions={transactions}
                currentUserAccountID={currentUserAccountID}
                currentUserEmail={currentUserEmail}
                delegateEmail={delegateEmail}
                isASAPSubmitBetaEnabled={isASAPSubmitBetaEnabled}
                hasViolations={hasViolations}
                hasAnyPendingRTERViolation={hasAnyPendingRTERViolation}
                isSubmittingAnimationRunning={isSubmittingAnimationRunning}
                stopAnimation={stopAnimation}
                startSubmittingAnimation={startSubmittingAnimation}
                isTrackIntentUser={isTrackIntentUser ?? false}
            />
        </ReportSubmitToPopoverAnchor>
    );
}

export default SubmitActionButton;
