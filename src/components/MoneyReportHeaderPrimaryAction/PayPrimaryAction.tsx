import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {useSearchStateContext} from '@components/Search/SearchContext';
import AnimatedSettlementButton from '@components/SettlementButton/AnimatedSettlementButton';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useNonReimbursablePaymentModal from '@hooks/useNonReimbursablePaymentModal';
import useOnyx from '@hooks/useOnyx';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import usePolicy from '@hooks/usePolicy';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {search} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import {
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasOnlyNonReimbursableTransactions,
    hasUpdatedTotal,
    isAllowedToApproveExpenseReport,
    isInvoiceReport as isInvoiceReportUtil,
} from '@libs/ReportUtils';
import {isExpensifyCardTransaction, isPending} from '@libs/TransactionUtils';
import {canApproveIOU, canIOUBePaid as canIOUBePaidAction, payInvoice, payMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import useConfirmApproval from './useConfirmApproval';
import useTransactionThreadData from './useTransactionThreadData';

type PayPrimaryActionProps = {
    reportID: string | undefined;
    chatReportID: string | undefined;
    isPaidAnimationRunning: boolean;
    isApprovedAnimationRunning: boolean;
    stopAnimation: () => void;
    startAnimation: () => void;
    startApprovedAnimation: () => void;
    onHoldMenuOpen: (requestType: string, paymentType?: PaymentMethodType, methodID?: number) => void;
};

function PayPrimaryAction({
    reportID,
    chatReportID,
    isPaidAnimationRunning,
    isApprovedAnimationRunning,
    stopAnimation,
    startAnimation,
    startApprovedAnimation,
    onHoldMenuOpen,
}: PayPrimaryActionProps) {
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

    const canIOUBePaid = canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, transaction ? [transaction] : undefined, false, undefined, invoiceReceiverPolicy);
    const reportHasOnlyNonReimbursableTransactions = hasOnlyNonReimbursableTransactions(moneyRequestReport?.reportID, transactions);
    const {showNonReimbursablePaymentErrorModal, shouldBlockDirectPayment, nonReimbursablePaymentErrorDecisionModal} = useNonReimbursablePaymentModal(moneyRequestReport, transactions);
    const onlyShowPayElsewhere = reportHasOnlyNonReimbursableTransactions
        ? false
        : !canIOUBePaid && canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, transaction ? [transaction] : undefined, true, undefined, invoiceReceiverPolicy);
    const shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere || (reportHasOnlyNonReimbursableTransactions && (moneyRequestReport?.total ?? 0) !== 0);
    const shouldShowApproveButton = (canApproveIOU(moneyRequestReport, policy, reportMetadata, transactions) && !hasOnlyPendingTransactions) || isApprovedAnimationRunning;
    const shouldDisableApproveButton = shouldShowApproveButton && !isAllowedToApproveExpenseReport(moneyRequestReport);
    const canAllowSettlement = hasUpdatedTotal(moneyRequestReport, policy);
    const totalAmount = getTotalAmountForIOUReportPreviewButton(moneyRequestReport, policy, CONST.REPORT.PRIMARY_ACTIONS.PAY);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(moneyRequestReport?.reportID);

    const {currentSearchQueryJSON, currentSearchKey, currentSearchResults} = useSearchStateContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);

    const confirmApproval = useConfirmApproval(reportID, startApprovedAnimation, onHoldMenuOpen);

    const confirmPayment = ({paymentType: type, payAsBusiness, methodID, paymentMethod}: PaymentActionParams) => {
        if (!type || !chatReport) {
            return;
        }
        if (shouldBlockDirectPayment(type)) {
            showNonReimbursablePaymentErrorModal();
            return;
        }
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else if (isAnyTransactionOnHold) {
            onHoldMenuOpen(CONST.IOU.REPORT_ACTION_TYPE.PAY, type, methodID);
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
        <>
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
            {nonReimbursablePaymentErrorDecisionModal}
        </>
    );
}

export default PayPrimaryAction;
