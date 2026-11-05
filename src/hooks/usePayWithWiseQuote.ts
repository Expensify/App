import {payMoneyRequest} from '@libs/actions/IOU/PayMoneyRequest';
import type {PayMoneyRequestFunctionParams} from '@libs/actions/IOU/PayMoneyRequest';
import {getWiseQuote} from '@libs/actions/Wise';
import {shouldConfirmWiseQuoteBeforePaying} from '@libs/BankAccountUtils';

import useWiseQuoteConfirmModal from './useWiseQuoteConfirmModal';

/** Pays a report, first showing the Wise quote for the admin to confirm when Wise converts it into another currency */
function usePayWithWiseQuote() {
    const {showWiseQuoteConfirmModal} = useWiseQuoteConfirmModal();

    const payWithWiseQuote = (params: PayMoneyRequestFunctionParams) => {
        const reportID = params.iouReport?.reportID;
        if (!reportID || !shouldConfirmWiseQuoteBeforePaying(params)) {
            payMoneyRequest(params);
            return;
        }

        getWiseQuote(reportID);
        showWiseQuoteConfirmModal({
            reportID,
            isPayingUnheldOnly: params.full === false,
            onConfirm: (wiseQuoteID) => payMoneyRequest({...params, wiseQuoteID}),
        });
    };

    return {payWithWiseQuote};
}

export default usePayWithWiseQuote;
