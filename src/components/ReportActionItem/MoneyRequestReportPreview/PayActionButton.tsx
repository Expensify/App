import {delegateEmailSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import type {ValueOf} from 'type-fest';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import AnimatedSettlementButton from '@components/SettlementButton/AnimatedSettlementButton';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import {hasHeldExpenses as hasHeldExpensesReportUtils, hasUpdatedTotal, hasViolations as hasViolationsReportUtils, isInvoiceReport as isInvoiceReportUtils} from '@libs/ReportUtils';
import {payInvoice, payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';
import {approveMoneyRequest, canIOUBePaid as canIOUBePaidIOUActions} from '@userActions/IOU/ReportWorkflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type PayActionButtonProps = {
    iouReportID: string | undefined;
    chatReportID: string | undefined;
    isPaidAnimationRunning: boolean;
    isApprovedAnimationRunning: boolean;
    stopAnimation: () => void;
    startAnimation: () => void;
    startApprovedAnimation: () => void;
    onPaymentOptionsShow?: () => void;
    onPaymentOptionsHide?: () => void;
    onHoldMenuOpen: (requestType: string, paymentType?: PaymentMethodType, canPay?: boolean) => void;
    buttonMaxWidth: {maxWidth?: number};
    reportPreviewAction: ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS>;
};

function PayActionButton({
    iouReportID,
    chatReportID,
    isPaidAnimationRunning,
    isApprovedAnimationRunning,
    stopAnimation,
    startAnimation,
    startApprovedAnimation,
    onPaymentOptionsShow,
    onPaymentOptionsHide,
    onHoldMenuOpen,
    buttonMaxWidth,
    reportPreviewAction,
}: PayActionButtonProps) {
    const {isOffline} = useNetwork();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const {isBetaEnabled} = usePermissions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const activePolicy = usePolicy(activePolicyID);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`);
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined}`,
    );
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [iouReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReportID}`);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});

    const reportTransactionsCollection = useReportTransactionsCollection(iouReportID);
    const transactions = Object.values(reportTransactionsCollection ?? {}).filter(
        (t): t is Transaction => !!t && (isOffline || t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
    );

    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);
    const canAllowSettlement = hasUpdatedTotal(iouReport, policy);
    const hasViolations = hasViolationsReportUtils(iouReport?.reportID, transactionViolations, currentUserAccountID, currentUserEmail);

    const canIOUBePaid = canIOUBePaidIOUActions(iouReport, chatReport, policy, bankAccountList, transactions, false, undefined, invoiceReceiverPolicy);
    const onlyShowPayElsewhere = !canIOUBePaid && canIOUBePaidIOUActions(iouReport, chatReport, policy, bankAccountList, transactions, true, undefined, invoiceReceiverPolicy);
    const shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere;
    const shouldShowOnlyPayElsewhere = !canIOUBePaid && onlyShowPayElsewhere;
    const canIOUBePaidAndApproved = canIOUBePaid;

    const formattedAmount = getTotalAmountForIOUReportPreviewButton(iouReport, policy, reportPreviewAction, transactions);

    const confirmApproval = () => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else if (hasHeldExpensesReportUtils(iouReport?.reportID)) {
            onHoldMenuOpen(CONST.IOU.REPORT_ACTION_TYPE.APPROVE, undefined, shouldShowPayButton);
        } else {
            approveMoneyRequest({
                expenseReport: iouReport,
                expenseReportPolicy: policy,
                policy: activePolicy,
                currentUserAccountIDParam: currentUserAccountID,
                currentUserEmailParam: currentUserEmail,
                hasViolations,
                isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: iouReportNextStep,
                betas,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                full: true,
                onApproved: startApprovedAnimation,
                delegateEmail,
            });
        }
    };

    const confirmPayment = ({paymentType: type, payAsBusiness, methodID, paymentMethod}: PaymentActionParams) => {
        if (!type) {
            return;
        }
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else if (hasHeldExpensesReportUtils(iouReport?.reportID)) {
            onHoldMenuOpen(CONST.IOU.REPORT_ACTION_TYPE.PAY, type, shouldShowPayButton);
        } else if (chatReport && iouReport) {
            if (isInvoiceReportUtils(iouReport)) {
                startAnimation();
                payInvoice({
                    paymentMethodType: type,
                    chatReport,
                    invoiceReport: iouReport,
                    invoiceReportCurrentNextStepDeprecated: iouReportNextStep,
                    introSelected,
                    currentUserAccountIDParam: currentUserAccountID,
                    currentUserEmailParam: currentUserEmail,
                    payAsBusiness,
                    existingB2BInvoiceReport,
                    methodID,
                    paymentMethod,
                    activePolicy,
                    betas,
                    isSelfTourViewed,
                });
            } else {
                payMoneyRequest({
                    paymentType: type,
                    chatReport,
                    iouReport,
                    introSelected,
                    iouReportCurrentNextStepDeprecated: iouReportNextStep,
                    currentUserAccountID,
                    activePolicy,
                    policy,
                    betas,
                    isSelfTourViewed,
                    userBillingGracePeriodEnds,
                    amountOwed,
                    ownerBillingGracePeriodEnd,
                    onPaid: startAnimation,
                });
            }
        }
    };

    return (
        <AnimatedSettlementButton
            onlyShowPayElsewhere={shouldShowOnlyPayElsewhere}
            isPaidAnimationRunning={isPaidAnimationRunning}
            isApprovedAnimationRunning={isApprovedAnimationRunning}
            canIOUBePaid={canIOUBePaidAndApproved || isPaidAnimationRunning}
            onAnimationFinish={stopAnimation}
            chatReportID={chatReportID}
            policyID={policy?.id}
            iouReport={iouReport}
            currency={iouReport?.currency}
            wrapperStyle={buttonMaxWidth}
            onPress={confirmPayment}
            onPaymentOptionsShow={onPaymentOptionsShow}
            onPaymentOptionsHide={onPaymentOptionsHide}
            formattedAmount={formattedAmount}
            confirmApproval={confirmApproval}
            enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
            shouldHidePaymentOptions={!shouldShowPayButton}
            kycWallAnchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }}
            paymentMethodDropdownAnchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }}
            isDisabled={isOffline && !canAllowSettlement}
            isLoading={!isOffline && !canAllowSettlement}
            sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.PAY_BUTTON}
        />
    );
}

export default PayActionButton;
