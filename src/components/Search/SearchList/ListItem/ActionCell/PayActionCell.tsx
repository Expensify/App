import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';
import SettlementButton from '@components/SettlementButton';
import type {PaymentActionParams} from '@components/SettlementButton/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {getParticipantsInvoiceReport} from '@hooks/useParticipantsInvoiceReport';
import {useReportPaymentContext} from '@hooks/usePaymentContext';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useThemeStyles from '@hooks/useThemeStyles';

import {payInvoice, payMoneyRequest} from '@libs/actions/IOU/PayMoneyRequest';
import {canIOUBePaid} from '@libs/actions/IOU/ReportWorkflow';
import {getChatReportWithFallback, getSearchPayOnyxData} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Log from '@libs/Log';
import {getReimbursableTotal, isIndividualInvoiceRoom, isInvoiceReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';

type PayActionCellProps = {
    isLoading: boolean;
    policyID: string;
    reportID: string;
    hash?: number;
    amount?: number;
    shouldDisablePointerEvents?: boolean;
    chatReport: OnyxEntry<Report>;
};

function PayActionCell({isLoading, policyID, reportID, hash, amount, shouldDisablePointerEvents, chatReport}: PayActionCellProps) {
    const {isBetaEnabled} = usePermissions();
    const styles = useThemeStyles();
    const {getCurrencyDecimals, convertToDisplayString} = useCurrencyListActions();
    const {isOffline} = useNetwork();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const [iouReport, transactions] = useReportWithTransactionsAndViolations(reportID);
    const policy = usePolicy(policyID);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
    const invoiceReceiverPolicy = usePolicy(invoiceReceiverPolicyID);
    const {
        currentUserLogin,
        currentUserAccountID,
        email,
        localCurrencyCode,
        introSelected,
        betas,
        isSelfTourViewed,
        userBillingGracePeriodEnds,
        amountOwed,
        ownerBillingGracePeriodEnd,
        activePolicyID,
        activePolicy,
        conciergeChat,
        defaultWorkspaceName,
        chatReportPolicy,
        delegateAccountID,
    } = useReportPaymentContext({
        chatReportPolicyID: chatReport?.policyID,
    });

    const canBePaid = canIOUBePaid(iouReport, chatReport, policy, bankAccountList, currentUserLogin ?? '', currentUserAccountID, transactions, false, undefined, invoiceReceiverPolicy);
    const shouldOnlyShowElsewhere =
        !canBePaid && canIOUBePaid(iouReport, chatReport, policy, bankAccountList, currentUserLogin ?? '', currentUserAccountID, transactions, true, undefined, invoiceReceiverPolicy);

    const {currency} = iouReport ?? {};

    const confirmPayment = ({paymentType: type, payAsBusiness, methodID, paymentMethod}: PaymentActionParams) => {
        if (!type || !reportID || !hash || !amount) {
            Log.info('[SearchPay] Dropping row pay: missing required data', false, {
                hasPaymentType: !!type,
                reportID,
                hasHash: !!hash,
                hasAmount: !!amount,
            });
            return;
        }

        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        const additionalOnyxData = getSearchPayOnyxData(hash, reportID);

        if (isInvoiceReport(iouReport)) {
            // Invoice payments rely on the invoice room data, so they can't proceed without the chat report.
            if (!chatReport) {
                Log.info('[SearchPay] Dropping invoice row pay: chat report is not loaded', false, {reportID});
                return;
            }
            const existingB2BInvoiceReport = getParticipantsInvoiceReport(
                allReports,
                reportNameValuePairs,
                activePolicyID,
                CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                invoiceReceiverPolicyID ?? chatReport?.policyID,
            );

            // getPayMoneyRequestParams resolves the chat report from `chatReport` but swaps to `existingB2BInvoiceReport`
            // when paying an individual invoice room as a business. `payAsBusiness` is only known at click time, so pick
            // the right report's actions here in the function scope.
            const shouldUseB2BInvoiceReport = !!payAsBusiness && !!existingB2BInvoiceReport && isIndividualInvoiceRoom(chatReport);
            const chatReportActions =
                allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(shouldUseB2BInvoiceReport ? existingB2BInvoiceReport?.reportID : chatReport?.reportID)}`];

            payInvoice({
                isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
                getCurrencyDecimals,
                paymentMethodType: type,
                chatReport,
                invoiceReport: iouReport,
                introSelected,
                currentUserAccountIDParam: currentUserAccountID,
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
                defaultWorkspaceName,
                additionalOnyxData,
                chatReportActions,
                delegateAccountID,
                isTrackIntentUser,
            });
            return;
        }

        // The chat report is only needed for optimistic chat updates, so when it isn't loaded, pay with a fallback
        // built from the known IDs and let the server fill in the chat data.
        const fallbackChatReportID = iouReport?.chatReportID ?? iouReport?.parentReportID;
        const fallbackPolicyID = iouReport?.policyID ?? policyID;
        const {chatReport: chatReportForPayment, isFallbackChatReport} = getChatReportWithFallback(chatReport, fallbackChatReportID, fallbackPolicyID);
        if (!chatReportForPayment) {
            Log.info('[SearchPay] Dropping row pay: chat report is not loaded and no chatReportID is available', false, {reportID});
            return;
        }

        payMoneyRequest({
            isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
            getCurrencyDecimals,
            paymentType: type,
            chatReport: chatReportForPayment,
            isFallbackChatReport,
            iouReport,
            introSelected,
            currentUserAccountID,
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
            additionalOnyxData,
            chatReportActions: allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(chatReport?.reportID)}`],
            delegateAccountID,
            isTrackIntentUser,
            conciergeChat,
        });
    };

    return (
        <SearchScopeProvider isOnSearch={false}>
            <SettlementButton
                shouldUseShortForm
                size={CONST.BUTTON_SIZE.SMALL}
                currency={currency}
                formattedAmount={convertToDisplayString(Math.abs(getReimbursableTotal(iouReport)), currency)}
                policyID={policyID || iouReport?.policyID}
                iouReport={iouReport}
                chatReportID={iouReport?.chatReportID}
                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                onPress={confirmPayment}
                style={[styles.w100, shouldDisablePointerEvents && styles.pointerEventsNone]}
                wrapperStyle={[styles.w100]}
                shouldShowPersonalBankAccountOption={!policyID && !iouReport?.policyID}
                isDisabled={isOffline || shouldDisablePointerEvents}
                stayNormalOnDisable={shouldDisablePointerEvents}
                isLoading={isLoading}
                onlyShowPayElsewhere={shouldOnlyShowElsewhere}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.ACTION_CELL_PAY}
            />
        </SearchScopeProvider>
    );
}

export default PayActionCell;
