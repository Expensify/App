import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';
import SettlementButton from '@components/SettlementButton';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {getParticipantsInvoiceReport} from '@hooks/useParticipantsInvoiceReport';
import {useReportPaymentContext} from '@hooks/usePaymentContext';
import usePolicy from '@hooks/usePolicy';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useThemeStyles from '@hooks/useThemeStyles';
import {payInvoice, payMoneyRequest} from '@libs/actions/IOU/PayMoneyRequest';
import {canIOUBePaid} from '@libs/actions/IOU/ReportWorkflow';
import {getSearchPayOnyxData} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getReimbursableTotal, isIndividualInvoiceRoom, isInvoiceReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

type PayActionCellProps = {
    isLoading: boolean;
    policyID: string;
    reportID: string;
    hash?: number;
    amount?: number;
    extraSmall: boolean;
    shouldDisablePointerEvents?: boolean;
    chatReport: OnyxEntry<Report>;
};

function PayActionCell({isLoading, policyID, reportID, hash, amount, extraSmall, shouldDisablePointerEvents, chatReport}: PayActionCellProps) {
    const styles = useThemeStyles();
    const {convertToDisplayString} = useCurrencyListActions();
    const {isOffline} = useNetwork();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const [iouReport, transactions] = useReportWithTransactionsAndViolations(reportID);
    const policy = usePolicy(policyID);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
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
        defaultWorkspaceName,
        nextStep,
        chatReportPolicy,
    } = useReportPaymentContext({
        reportID,
        chatReportPolicyID: chatReport?.policyID,
    });

    const canBePaid = canIOUBePaid(iouReport, chatReport, policy, bankAccountList, currentUserLogin ?? '', currentUserAccountID, transactions, false, undefined, invoiceReceiverPolicy);
    const shouldOnlyShowElsewhere =
        !canBePaid && canIOUBePaid(iouReport, chatReport, policy, bankAccountList, currentUserLogin ?? '', currentUserAccountID, transactions, true, undefined, invoiceReceiverPolicy);

    const {currency} = iouReport ?? {};

    const confirmPayment = ({paymentType: type, payAsBusiness, methodID, paymentMethod}: PaymentActionParams) => {
        if (!type || !reportID || !hash || !amount || !chatReport) {
            return;
        }

        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        const additionalOnyxData = getSearchPayOnyxData(hash, reportID);

        if (isInvoiceReport(iouReport)) {
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
                paymentMethodType: type,
                chatReport,
                invoiceReport: iouReport,
                invoiceReportCurrentNextStepDeprecated: nextStep,
                introSelected,
                currentUserAccountIDParam: currentUserAccountID,
                currentUserEmailParam: email ?? '',
                currentUserLocalCurrency: localCurrencyCode ?? CONST.CURRENCY.USD,
                payAsBusiness,
                existingB2BInvoiceReport,
                methodID,
                paymentMethod,
                activePolicy,
                betas,
                isSelfTourViewed,
                defaultWorkspaceName,
                additionalOnyxData,
                chatReportActions,
            });
            return;
        }

        payMoneyRequest({
            paymentType: type,
            chatReport,
            iouReport,
            introSelected,
            iouReportCurrentNextStepDeprecated: nextStep,
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
        });
    };

    return (
        <SearchScopeProvider isOnSearch={false}>
            <SettlementButton
                shouldUseShortForm
                buttonSize={extraSmall ? CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL : CONST.DROPDOWN_BUTTON_SIZE.SMALL}
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
                shouldStayNormalOnDisable={shouldDisablePointerEvents}
                isLoading={isLoading}
                onlyShowPayElsewhere={shouldOnlyShowElsewhere}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.ACTION_CELL_PAY}
            />
        </SearchScopeProvider>
    );
}

export default PayActionCell;
