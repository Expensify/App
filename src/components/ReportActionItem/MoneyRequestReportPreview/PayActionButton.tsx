import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import AnimatedSettlementButton from '@components/SettlementButton/AnimatedSettlementButton';
import type {PaymentActionParams} from '@components/SettlementButton/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import usePayChatReportActions from '@hooks/usePayChatReportActions';
import usePolicy from '@hooks/usePolicy';
import useReportTransactionViolations from '@hooks/useReportTransactionViolations';

import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import {isTrackOnboardingChoice} from '@libs/OnboardingUtils';
import {hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {
    getReportOrDraftReport,
    hasHeldExpensesFromTransactions as hasHeldExpensesReportUtils,
    hasUpdatedTotal,
    hasViolations as hasViolationsReportUtils,
    isInvoiceReport as isInvoiceReportUtils,
} from '@libs/ReportUtils';

import {payInvoice, payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';

import {useReportPreviewActions, useReportPreviewActionState, useReportPreviewAnimationState, useReportPreviewData, useReportPreviewUIState} from './MoneyRequestReportPreviewContext';
import useConfirmApproveReportAction from './useConfirmApproveReportAction';
import useReportPreviewActionButtonData from './useReportPreviewActionButtonData';
import useReportPreviewFilteredTransactions from './useReportPreviewFilteredTransactions';

function PayActionButton() {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const lastWorkspaceNumber = useLastWorkspaceNumber();
    const {convertToDisplayString} = useCurrencyListActions();

    const {iouReportID, chatReportID, chatReport} = useReportPreviewData();
    const {isPaidAnimationRunning, isApprovedAnimationRunning} = useReportPreviewAnimationState();
    const {stopAnimation, startAnimation, onPaymentOptionsShow, onPaymentOptionsHide, onHoldMenuOpen} = useReportPreviewActions();
    const {buttonMaxWidth} = useReportPreviewUIState();
    const {reportPreviewAction, canIOUBePaid, onlyShowPayElsewhere, shouldShowPayButton} = useReportPreviewActionState();

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const activePolicy = usePolicy(activePolicyID);
    const actionButtonData = useReportPreviewActionButtonData(iouReportID);
    const {iouReport, policy, userBillingGracePeriodEnds, iouReportNextStep, amountOwed, ownerBillingGracePeriodEnd} = actionButtonData;
    const chatReportPolicy = usePolicy(chatReport?.policyID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});

    const transactions = useReportPreviewFilteredTransactions(iouReportID);

    const [transactionViolations] = useReportTransactionViolations(transactions);
    const isTrackIntentUser = isTrackOnboardingChoice(introSelected?.choice);

    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);
    const getChatReportActions = usePayChatReportActions(chatReport, existingB2BInvoiceReport);
    const canAllowSettlement = hasUpdatedTotal(iouReport, policy);
    const hasViolations = hasViolationsReportUtils(iouReport?.reportID, transactionViolations, currentUserAccountID, currentUserEmail, undefined, transactions);

    const shouldShowOnlyPayElsewhere = !canIOUBePaid && onlyShowPayElsewhere;
    const canIOUBePaidAndApproved = canIOUBePaid;

    const formattedAmount = getTotalAmountForIOUReportPreviewButton(iouReport, policy, reportPreviewAction, transactions, convertToDisplayString);

    const confirmApproval = useConfirmApproveReportAction(actionButtonData, transactions, hasViolations);

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
                    isTrackIntentUser,
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
                    isTrackIntentUser,
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
