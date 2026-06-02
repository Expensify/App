import React from 'react';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';
import SettlementButton from '@components/SettlementButton';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import usePolicy from '@hooks/usePolicy';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useThemeStyles from '@hooks/useThemeStyles';
import {payInvoice, payMoneyRequest} from '@libs/actions/IOU/PayMoneyRequest';
import {canIOUBePaid} from '@libs/actions/IOU/ReportWorkflow';
import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import {getSearchPayOnyxData} from '@libs/actions/Search';
import {isInvoiceReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';

type PayActionCellProps = {
    isLoading: boolean;
    policyID: string;
    reportID: string;
    hash?: number;
    amount?: number;
    extraSmall: boolean;
    shouldDisablePointerEvents?: boolean;
};

function PayActionCell({isLoading, policyID, reportID, hash, amount, extraSmall, shouldDisablePointerEvents}: PayActionCellProps) {
    const styles = useThemeStyles();
    const {convertToDisplayString} = useCurrencyListActions();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const [iouReport, transactions] = useReportWithTransactionsAndViolations(reportID);
    const policy = usePolicy(policyID);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`);
    const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
    const invoiceReceiverPolicy = usePolicy(invoiceReceiverPolicyID);
    const {login: currentUserLogin, accountID: currentUserAccountID, email, localCurrencyCode} = useCurrentUserPersonalDetails();
    const lastWorkspaceNumber = useLastWorkspaceNumber();
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const activePolicy = usePolicy(activePolicyID);
    const chatReportPolicy = usePolicy(chatReport?.policyID);
    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);

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
                defaultWorkspaceName: generateDefaultWorkspaceName(email ?? '', lastWorkspaceNumber, translate),
                additionalOnyxData,
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
            conciergeReportID,
            additionalOnyxData,
        });
    };

    return (
        <SearchScopeProvider isOnSearch={false}>
            <SettlementButton
                shouldUseShortForm
                buttonSize={extraSmall ? CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL : CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                currency={currency}
                formattedAmount={convertToDisplayString(Math.abs(iouReport?.total ?? 0), currency)}
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
