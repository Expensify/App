import {payMoneyRequest} from '@libs/actions/IOU/PayMoneyRequest';
import type {PayMoneyRequestFunctionParams} from '@libs/actions/IOU/PayMoneyRequest';
import {getWiseQuote} from '@libs/actions/Wise';
import {getBankAccountIDForPayment, shouldConfirmWiseQuoteBeforePaying} from '@libs/BankAccountUtils';

import useWiseQuoteConfirmModal from './useWiseQuoteConfirmModal';

type PayWithWiseQuoteParams = PayMoneyRequestFunctionParams & {
    /** Runs after the payment request is queued, so it is skipped when the admin cancels the quote */
    onPaymentSent?: () => void;
};

/** Pays a report, first showing the Wise quote for the admin to confirm when an expense is in another currency than the bank account */
function usePayWithWiseQuote() {
    const {showWiseQuoteConfirmModal} = useWiseQuoteConfirmModal();

    const payWithWiseQuote = ({onPaymentSent, ...params}: PayWithWiseQuoteParams) => {
        const iouReport = params.iouReport;
        const reportID = iouReport?.reportID;
        const bankAccountID = getBankAccountIDForPayment(params);
        if (!iouReport || !reportID || !bankAccountID || !shouldConfirmWiseQuoteBeforePaying(params)) {
            payMoneyRequest(params);
            onPaymentSent?.();
            return;
        }

        const isPayingUnheldOnly = params.full === false;
        const getQuote = () => getWiseQuote(iouReport, !isPayingUnheldOnly, bankAccountID, params.policy?.globalReimbursementFXPreferCompany);
        getQuote();
        showWiseQuoteConfirmModal({
            reportID,
            isPayingUnheldOnly,
            getNewQuotes: getQuote,
            onConfirm: (wiseQuoteID) => {
                payMoneyRequest({...params, wiseQuoteID});
                onPaymentSent?.();
            },
        });
    };

    return {payWithWiseQuote};
}

export default usePayWithWiseQuote;
