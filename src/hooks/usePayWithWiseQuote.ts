import {payMoneyRequest} from '@libs/actions/IOU/PayMoneyRequest';
import type {PayMoneyRequestFunctionParams} from '@libs/actions/IOU/PayMoneyRequest';
import {getWiseQuote} from '@libs/actions/Wise';
import {shouldConfirmWiseQuoteBeforePaying} from '@libs/BankAccountUtils';

import useWiseQuoteConfirmModal from './useWiseQuoteConfirmModal';

/** Pays a report, first showing the Wise quote for the admin to confirm when an expense is in another currency than the bank account */
function usePayWithWiseQuote() {
    const {showWiseQuoteConfirmModal} = useWiseQuoteConfirmModal();

    const payWithWiseQuote = (params: PayMoneyRequestFunctionParams) => {
        const reportID = params.iouReport?.reportID;
        if (!reportID || !shouldConfirmWiseQuoteBeforePaying(params)) {
            payMoneyRequest(params);
            return;
        }

        const isPayingUnheldOnly = params.full === false;
        getWiseQuote(reportID, !isPayingUnheldOnly);
        showWiseQuoteConfirmModal({
            reportID,
            isPayingUnheldOnly,
            onConfirm: (wiseQuoteID) => payMoneyRequest({...params, wiseQuoteID}),
        });
    };

    return {payWithWiseQuote};
}

export default usePayWithWiseQuote;
