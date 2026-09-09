import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {useMoneyReportHeaderModals} from '@components/MoneyReportHeaderModalsContext';
import {usePaymentAnimationsContext} from '@components/PaymentAnimationsContext';
import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
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
import usePolicy from '@hooks/usePolicy';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import {search} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import {isTrackOnboardingChoice} from '@libs/OnboardingUtils';
import {hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {hasHeldExpensesFromTransactions as hasHeldExpensesReportUtils, hasUpdatedTotal, isInvoiceReport as isInvoiceReportUtil} from '@libs/ReportUtils';

import {payInvoice, payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';
import {canIOUBePaid as canIOUBePaidAction} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';

import useTransactionThreadData from './useTransactionThreadData';

type PayPrimaryActionProps = {
    reportID: string | undefined;
    chatReportID: string | undefined;
};

function PayPrimaryAction({reportID, chatReportID}: PayPrimaryActionProps) {
    const {isPaidAnimationRunning, isApprovedAnimationRunning, stopAnimation, startAnimation} = usePaymentAnimationsContext();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const {accountID, email, login: currentUserLogin, localCurrencyCode} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const lastWorkspaceNumber = useLastWorkspaceNumber();

    const {moneyRequestReport, chatReport, transaction} = useTransactionThreadData(reportID, chatReportID);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);

    const activePolicy = usePolicy(activePolicyID);
    const chatReportPolicy = usePolicy(chatReport?.policyID);
    const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicyID}`);
    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);
    const getChatReportActions = usePayChatReportActions(chatReport, existingB2BInvoiceReport);
    const {getCurrencyDecimals, convertToDisplayString} = useCurrencyListActions();
    const isTrackIntentUser = isTrackOnboardingChoice(introSelected?.choice);

    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);

    const {transactions: reportTransactionsMap} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactionsMap);
    const nonPendingDeleteTransactions = transactions.filter((t): t is Transaction => !!t && (isOffline || t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE));

    const canIOUBePaid = canIOUBePaidAction(
        moneyRequestReport,
        chatReport,
        policy,
        bankAccountList,
        currentUserLogin ?? '',
        accountID,
        transaction ? [transaction] : undefined,
        false,
        undefined,
        invoiceReceiverPolicy,
    );
    const onlyShowPayElsewhere =
        !canIOUBePaid &&
        canIOUBePaidAction(
            moneyRequestReport,
            chatReport,
            policy,
            bankAccountList,
            currentUserLogin ?? '',
            accountID,
            transaction ? [transaction] : undefined,
            true,
            undefined,
            invoiceReceiverPolicy,
        );
    const shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere;
    const canAllowSettlement = hasUpdatedTotal(moneyRequestReport, policy);
    const totalAmount = getTotalAmountForIOUReportPreviewButton(moneyRequestReport, policy, CONST.REPORT.PRIMARY_ACTIONS.PAY, nonPendingDeleteTransactions, convertToDisplayString);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(transactions);

    const {currentSearchQueryJSON, currentSearchKey} = useSearchQueryContext();
    const {currentSearchResults} = useSearchResultsContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);

    const {openHoldMenu} = useMoneyReportHeaderModals();

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
                getCurrencyDecimals,
                paymentMethodType: type,
                chatReport,
                invoiceReport: moneyRequestReport,
                introSelected,
                currentUserAccountIDParam: accountID,
                currentUserEmailParam: email ?? '',
                currentUserLocalCurrency: localCurrencyCode ?? CONST.CURRENCY.USD,
                payAsBusiness,
                existingB2BInvoiceReport,
                methodID,
                paymentMethod,
                activePolicy,
                conciergeChat,
                betas,
                isSelfTourViewed,
                defaultWorkspaceName: generateDefaultWorkspaceName(email ?? '', lastWorkspaceNumber, translate),
                chatReportActions: getChatReportActions(payAsBusiness),
                delegateAccountID,
                isTrackIntentUser,
            });
        } else {
            startAnimation();
            payMoneyRequest({
                getCurrencyDecimals,
                paymentType: type,
                chatReport,
                iouReport: moneyRequestReport,
                introSelected,
                currentUserAccountID: accountID,
                currentUserLogin: currentUserLogin ?? '',
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
                isTrackIntentUser,
                conciergeChat,
            });
            if (currentSearchQueryJSON && !isOffline) {
                search({
                    searchKey: currentSearchKey,
                    shouldCalculateTotals,
                    offset: 0,
                    queryJSON: currentSearchQueryJSON,
                    isLoading: !!currentSearchResults?.search?.isLoading,
                });
            }
        }
    };

    return (
        <AnimatedSettlementButton
            isPaidAnimationRunning={isPaidAnimationRunning}
            isApprovedAnimationRunning={isApprovedAnimationRunning}
            isDEWApproval={hasDynamicExternalWorkflow(policy)}
            reportID={moneyRequestReport?.reportID}
            onAnimationFinish={stopAnimation}
            formattedAmount={totalAmount}
            canIOUBePaid
            onlyShowPayElsewhere={onlyShowPayElsewhere}
            currency={moneyRequestReport?.currency}
            policyID={moneyRequestReport?.policyID}
            chatReportID={chatReport?.reportID}
            iouReport={moneyRequestReport}
            onPress={confirmPayment}
            enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
            shouldHidePaymentOptions={!shouldShowPayButton}
            isDisabled={isOffline && !canAllowSettlement}
            isLoading={!isOffline && !canAllowSettlement}
        />
    );
}

export default PayPrimaryAction;
