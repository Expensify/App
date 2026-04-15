import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {useMoneyReportHeaderModals} from '@components/MoneyReportHeaderModalsContext';
import {usePaymentAnimationsContext} from '@components/PaymentAnimationsContext';
import {useSearchStateContext} from '@components/Search/SearchContext';
import AnimatedSettlementButton from '@components/SettlementButton/AnimatedSettlementButton';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import usePolicy from '@hooks/usePolicy';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {search} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import {hasHeldExpenses as hasHeldExpensesReportUtils, hasUpdatedTotal, isAllowedToApproveExpenseReport, isInvoiceReport as isInvoiceReportUtil} from '@libs/ReportUtils';
import {isExpensifyCardTransaction, isPending} from '@libs/TransactionUtils';
import {payInvoice, payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';
import {canApproveIOU, canIOUBePaid as canIOUBePaidAction} from '@userActions/IOU/ReportWorkflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';
import useConfirmApproval from './useConfirmApproval';
import useTransactionThreadData from './useTransactionThreadData';

type PayPrimaryActionProps = {
    reportID: string | undefined;
    chatReportID: string | undefined;
};

function PayPrimaryAction({reportID, chatReportID}: PayPrimaryActionProps) {
    const {isPaidAnimationRunning, isApprovedAnimationRunning, stopAnimation, startAnimation, startApprovedAnimation} = usePaymentAnimationsContext();
    const {isOffline} = useNetwork();
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const {moneyRequestReport, chatReport, transaction} = useTransactionThreadData(reportID, chatReportID);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${moneyRequestReport?.reportID}`);

    const activePolicy = usePolicy(activePolicyID);
    const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicyID}`);
    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);

    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);

    const {transactions: reportTransactionsMap} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactionsMap);
    const hasOnlyPendingTransactions = transactions.length > 0 && transactions.every((t) => isExpensifyCardTransaction(t) && isPending(t));
    const nonPendingDeleteTransactions = transactions.filter((t): t is Transaction => !!t && (isOffline || t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE));

    const canIOUBePaid = canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, transaction ? [transaction] : undefined, false, undefined, invoiceReceiverPolicy);
    const onlyShowPayElsewhere =
        !canIOUBePaid && canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, transaction ? [transaction] : undefined, true, undefined, invoiceReceiverPolicy);
    const shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere;
    const shouldShowApproveButton = (canApproveIOU(moneyRequestReport, policy, reportMetadata, transactions) && !hasOnlyPendingTransactions) || isApprovedAnimationRunning;
    const shouldDisableApproveButton = shouldShowApproveButton && !isAllowedToApproveExpenseReport(moneyRequestReport);
    const canAllowSettlement = hasUpdatedTotal(moneyRequestReport, policy);
    const totalAmount = getTotalAmountForIOUReportPreviewButton(moneyRequestReport, policy, CONST.REPORT.PRIMARY_ACTIONS.PAY, nonPendingDeleteTransactions);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(moneyRequestReport?.reportID);

    const {currentSearchQueryJSON, currentSearchKey, currentSearchResults} = useSearchStateContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);

    const {openHoldMenu} = useMoneyReportHeaderModals();

    const confirmApproval = useConfirmApproval(reportID, startApprovedAnimation);

    const confirmPayment = ({paymentType: type, payAsBusiness, methodID, paymentMethod}: PaymentActionParams) => {
        if (!type || !chatReport) {
            return;
        }
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else if (isAnyTransactionOnHold) {
            openHoldMenu({
                requestType: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: type,
                methodID,
                onConfirm: () => startAnimation(),
            });
        } else if (isInvoiceReport) {
            startAnimation();
            payInvoice({
                paymentMethodType: type,
                chatReport,
                invoiceReport: moneyRequestReport,
                invoiceReportCurrentNextStepDeprecated: nextStep,
                introSelected,
                currentUserAccountIDParam: accountID,
                currentUserEmailParam: email ?? '',
                payAsBusiness,
                existingB2BInvoiceReport,
                methodID,
                paymentMethod,
                activePolicy,
                betas,
                isSelfTourViewed,
            });
        } else {
            startAnimation();
            payMoneyRequest({
                paymentType: type,
                chatReport,
                iouReport: moneyRequestReport,
                introSelected,
                iouReportCurrentNextStepDeprecated: nextStep,
                currentUserAccountID: accountID,
                activePolicy,
                policy,
                betas,
                isSelfTourViewed,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                methodID: type === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined,
                onPaid: startAnimation,
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
        }
    };

    return (
        <AnimatedSettlementButton
            isPaidAnimationRunning={isPaidAnimationRunning}
            isApprovedAnimationRunning={isApprovedAnimationRunning}
            onAnimationFinish={stopAnimation}
            formattedAmount={totalAmount}
            canIOUBePaid
            onlyShowPayElsewhere={onlyShowPayElsewhere}
            currency={moneyRequestReport?.currency}
            confirmApproval={confirmApproval}
            policyID={moneyRequestReport?.policyID}
            chatReportID={chatReport?.reportID}
            iouReport={moneyRequestReport}
            onPress={confirmPayment}
            enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
            shouldHidePaymentOptions={!shouldShowPayButton}
            shouldShowApproveButton={shouldShowApproveButton}
            shouldDisableApproveButton={shouldDisableApproveButton}
            isDisabled={isOffline && !canAllowSettlement}
            isLoading={!isOffline && !canAllowSettlement}
        />
    );
}

export default PayPrimaryAction;
