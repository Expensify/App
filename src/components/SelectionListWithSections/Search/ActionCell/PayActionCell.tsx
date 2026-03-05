import React from 'react';
import type {ValueOf} from 'type-fest';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';
import SettlementButton from '@components/SettlementButton';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useThemeStyles from '@hooks/useThemeStyles';
import {canIOUBePaid} from '@libs/actions/IOU';
import {getPayMoneyOnSearchInvoiceParams, payMoneyRequestOnSearch} from '@libs/actions/Search';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {isInvoiceReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

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
    const {isOffline} = useNetwork();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const [iouReport, transactions] = useReportWithTransactionsAndViolations(reportID);
    const policy = usePolicy(policyID);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`);
    const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
    const invoiceReceiverPolicy = usePolicy(invoiceReceiverPolicyID);
    const canBePaid = canIOUBePaid(iouReport, chatReport, policy, bankAccountList, transactions, false, undefined, invoiceReceiverPolicy);
    const shouldOnlyShowElsewhere = !canBePaid && canIOUBePaid(iouReport, chatReport, policy, bankAccountList, transactions, true, undefined, invoiceReceiverPolicy);

    const {currency} = iouReport ?? {};

    const confirmPayment = ({paymentType: type, payAsBusiness, methodID, paymentMethod}: PaymentActionParams) => {
        if (!type || !reportID || !hash || !amount) {
            return;
        }

        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        const invoiceParams = getPayMoneyOnSearchInvoiceParams(policyID, payAsBusiness, methodID, paymentMethod);
        payMoneyRequestOnSearch(hash, [{amount, paymentType: type as ValueOf<typeof CONST.IOU.PAYMENT_TYPE>, reportID, ...(isInvoiceReport(iouReport) ? invoiceParams : {})}]);
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

export type {PayActionCellProps};
export default PayActionCell;
