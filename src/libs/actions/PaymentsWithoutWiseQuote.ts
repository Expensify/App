/**
 * Follows the payments sent from a Wise account without a quote until the backend answers them. App can't always tell a payment converts currency,
 * so when the backend asks for a quote, the payment is paid again once the admin confirms one. Writes go through the SequentialQueue, so the
 * payment can't wait for its own response. GlobalReimbursementPayError settles each one here instead.
 *
 * The payments are kept in memory, because only the tab that sends the requests gets their responses.
 */
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import type {PayMoneyRequestFunctionParams} from './IOU/PayMoneyRequest';

const paymentsByReportID = new Map<string, PayMoneyRequestFunctionParams>();

/** Starts following a payment. Call it before sending the payment, so its response isn't missed. */
function followPaymentWithoutWiseQuote(reportID: string, payment: PayMoneyRequestFunctionParams) {
    paymentsByReportID.set(reportID, payment);
}

/**
 * Records the response of a payment.
 *
 * @returns whether the payment is kept to be paid again with a quote, which only happens when it was followed and the backend asked for a quote
 */
function settlePaymentWithoutWiseQuote(reportID: string, isQuoteRequired: boolean): boolean {
    if (isQuoteRequired && paymentsByReportID.has(reportID)) {
        return true;
    }
    paymentsByReportID.delete(reportID);
    return false;
}

/** Returns the payment the backend asked a quote for and stops following it */
function takePaymentWithoutWiseQuote(reportID: string): PayMoneyRequestFunctionParams | undefined {
    const payment = paymentsByReportID.get(reportID);
    paymentsByReportID.delete(reportID);
    return payment;
}

/** Clears the backend signal, so the quote opens once */
function clearWiseQuoteRequired() {
    Onyx.set(ONYXKEYS.RAM_ONLY_WISE_QUOTE_REQUIRED, null);
}

export {clearWiseQuoteRequired, followPaymentWithoutWiseQuote, settlePaymentWithoutWiseQuote, takePaymentWithoutWiseQuote};
