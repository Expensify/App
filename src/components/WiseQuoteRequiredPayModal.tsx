import useOnyx from '@hooks/useOnyx';
import usePayWithWiseQuote from '@hooks/usePayWithWiseQuote';

import {clearWiseQuoteRequired, takePaymentWithoutWiseQuote} from '@userActions/PaymentsWithoutWiseQuote';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useEffectEvent} from 'react';

/** Shows the Wise quote for a payment the backend rejected for having none, and pays again once the admin confirms it */
function WiseQuoteRequiredPayModal() {
    const [wiseQuoteRequired] = useOnyx(ONYXKEYS.RAM_ONLY_WISE_QUOTE_REQUIRED);
    const reportIDToQuote = wiseQuoteRequired?.reportID;
    const {confirmWiseQuoteAndPay} = usePayWithWiseQuote();

    const payAgainWithQuote = useEffectEvent((reportID: string) => {
        clearWiseQuoteRequired();
        const payment = takePaymentWithoutWiseQuote(reportID);
        if (!payment) {
            return;
        }
        confirmWiseQuoteAndPay(payment);
    });

    useEffect(() => {
        if (!reportIDToQuote) {
            return;
        }
        payAgainWithQuote(reportIDToQuote);
    }, [reportIDToQuote]);

    return null;
}

export default WiseQuoteRequiredPayModal;
