import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import AnimatedSettlementButton from '@components/SettlementButton/AnimatedSettlementButton';
import type {PaymentActionParams} from '@components/SettlementButton/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import usePayChatReportActions from '@hooks/usePayChatReportActions';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useReportTransactionViolations from '@hooks/useReportTransactionViolations';

import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import {hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {
    getReportOrDraftReport,
    hasHeldExpensesFromTransactions as hasHeldExpensesReportUtils,
    hasUpdatedTotal,
    hasViolations as hasViolationsReportUtils,
    isInvoiceReport as isInvoiceReportUtils,
} from '@libs/ReportUtils';

import {payInvoice, payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';
import {approveMoneyRequest} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';

import {delegateEmailSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {personalDetailsLoginSelector} from '@selectors/PersonalDetails';
import React from 'react';

import {useReportPreviewActions, useReportPreviewActionState, useReportPreviewAnimationState, useReportPreviewData, useReportPreviewUIState} from './MoneyRequestReportPreviewContext';

function PayActionButton() {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const delegateAccountID = useDelegateAccountID();
    const {isBetaEnabled} = usePermissions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const lastWorkspaceNumber = useLastWorkspaceNumber();
    const {convertToDisplayString} = useCurrencyListActions();

    const {iouReportID, chatReportID, chatReport} = useReportPreviewData();
    const {isPaidAnimationRunning, isApprovedAnimationRunning} = useReportPreviewAnimationState();
    const {stopAnimation, startAnimation, startApprovedAnimation, onPaymentOptionsShow, onPaymentOptionsHide, onHoldMenuOpen} = useReportPreviewActions();
    const {buttonMaxWidth} = useReportPreviewUIState();
    const {reportPreviewAction, canIOUBePaid, onlyShowPayElsewhere, shouldShowPayButton} = useReportPreviewActionState();

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const activePolicy = usePolicy(activePolicyID);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
    const [ownerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(iouReport?.ownerAccountID)}, [iouReport?.ownerAccountID]);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`);
    const chatReportPolicy = usePolicy(chatReport?.policyID);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [iouReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReportID}`);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});

    const reportTransactionsCollection = useReportTransactionsCollection(iouReportID);
    const transactions = Object.values(reportTransactionsCollection ?? {}).filter(
        (t): t is Transaction => !!t && (isOffline || t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
    );

    const [transactionViolations] = useReportTransactionViolations(transactions);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);
    const getChatReportActions = usePayChatReportActions(chatReport, existingB2BInvoiceReport);
    const canAllowSettlement = hasUpdatedTotal(iouReport, policy);
    const hasViolations = hasViolationsReportUtils(iouReport?.reportID, transactionViolations, currentUserAccountID, currentUserEmail, undefined, transactions);

    const shouldShowOnlyPayElsewhere = !canIOUBePaid && onlyShowPayElsewhere;
    const canIOUBePaidAndApproved = canIOUBePaid;

    const formattedAmount = getTotalAmountForIOUReportPreviewButton(iouReport, policy, reportPreviewAction, transactions, convertToDisplayString);

    const confirmApproval = () => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else if (hasHeldExpensesReportUtils(transactions)) {
            onHoldMenuOpen(CONST.IOU.REPORT_ACTION_TYPE.APPROVE, undefined, shouldShowPayButton);
        } else {
            approveMoneyRequest({
                expenseReport: iouReport,
                expenseReportPolicy: policy,
                currentUserAccountIDParam: currentUserAccountID,
                currentUserEmailParam: currentUserEmail,
                hasViolations,
                isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: iouReportNextStep,
                betas,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                ownerLogin,
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
        } else if (hasHeldExpensesReportUtils(transactions)) {
            onHoldMenuOpen(CONST.IOU.REPORT_ACTION_TYPE.PAY, type, shouldShowPayButton, methodID);
        } else if (chatReport && iouReport) {
            const currentChatReport = getReportOrDraftReport(chatReportID) ?? chatReport;
            if (isInvoiceReportUtils(iouReport)) {
                startAnimation();
                payInvoice({
                    paymentMethodType: type,
                    chatReport: currentChatReport,
                    invoiceReport: iouReport,
                    invoiceReportCurrentNextStepDeprecated: iouReportNextStep,
                    introSelected,
                    currentUserAccountIDParam: currentUserAccountID,
                    currentUserEmailParam: currentUserEmail,
                    currentUserLocalCurrency: currentUserDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
                    payAsBusiness,
                    existingB2BInvoiceReport,
                    methodID,
                    paymentMethod,
                    activePolicy,
                    betas,
                    isSelfTourViewed,
                    defaultWorkspaceName: generateDefaultWorkspaceName(currentUserEmail, lastWorkspaceNumber, translate),
                    chatReportActions: getChatReportActions(payAsBusiness),
                    delegateAccountID,
                });
            } else {
                payMoneyRequest({
                    paymentType: type,
                    chatReport: currentChatReport,
                    iouReport,
                    introSelected,
                    iouReportCurrentNextStepDeprecated: iouReportNextStep,
                    currentUserAccountID,
                    currentUserLogin: currentUserDetails.login ?? '',
                    activePolicy,
                    policy,
                    chatReportPolicy,
                    betas,
                    isSelfTourViewed,
                    userBillingGracePeriodEnds,
                    amountOwed,
                    ownerBillingGracePeriodEnd,
                    methodID: type === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined,
                    onPaid: startAnimation,
                    chatReportActions: getChatReportActions(false),
                    delegateAccountID,
                });
            }
        }
    };

    return (
        <AnimatedSettlementButton
            onlyShowPayElsewhere={shouldShowOnlyPayElsewhere}
            isPaidAnimationRunning={isPaidAnimationRunning}
            isApprovedAnimationRunning={isApprovedAnimationRunning}
            isDEWApproval={hasDynamicExternalWorkflow(policy)}
            reportID={iouReportID}
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
