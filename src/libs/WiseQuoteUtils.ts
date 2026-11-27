import type {Report} from '@src/types/onyx';
import type {WiseQuoteRequest} from '@src/types/onyx/WiseQuote';

import {getReimbursableTotal, getUnheldReimbursableTotal} from './ReportUtils';

/** How long a saved quote must still be valid to be reused, so it doesn't expire while the admin reviews it */
const MIN_REUSED_QUOTE_VALIDITY_MS = 5 * 60 * 1000;

/** A quote counts as expired this long before its expiry time, since the device clock can differ from the server's */
const QUOTE_EXPIRY_MARGIN_MS = 30 * 1000;

/** The payment a quote is asked for, covering the whole reimbursable amount or only the part not on hold, the account paying it and who pays the FX costs */
function getWiseQuoteRequest(report: Report, full: boolean, bankAccountID: number, isFXCostPaidByCompany: boolean | undefined): WiseQuoteRequest {
    // Expense report totals are stored as negative numbers
    return {full, amount: Math.abs(full ? getReimbursableTotal(report) : getUnheldReimbursableTotal(report)), bankAccountID, isFXCostPaidByCompany};
}

/** Whether the report holds a quote for this same payment that stays valid long enough for the admin to review it */
function canReuseWiseQuote(report: Report, request: WiseQuoteRequest, now = Date.now()): boolean {
    const {wiseQuote, wiseQuoteRequest} = report;
    if (!wiseQuote?.wiseQuoteID || report.errorFields?.wiseQuote || !wiseQuoteRequest) {
        return false;
    }

    const isSamePayment =
        wiseQuoteRequest.full === request.full &&
        wiseQuoteRequest.amount === request.amount &&
        wiseQuoteRequest.bankAccountID === request.bankAccountID &&
        wiseQuoteRequest.isFXCostPaidByCompany === request.isFXCostPaidByCompany;
    const validityLeft = new Date(wiseQuote.expiresAt).getTime() - now;
    return isSamePayment && validityLeft > MIN_REUSED_QUOTE_VALIDITY_MS;
}

/** Whether the server answered the report's quote request with no quote, because the payment doesn't go through Wise */
function isPaidWithoutWiseQuote(report: Pick<Report, 'wiseQuote' | 'wiseQuoteRequest'> | undefined): boolean {
    return !report?.wiseQuote && !!report?.wiseQuoteRequest?.hasResponse;
}

/** Whether Wise would reject paying with a quote that expires at this time */
function isWiseQuoteExpired(expiresAt: string | undefined, now = Date.now()): boolean {
    if (!expiresAt) {
        return false;
    }
    return new Date(expiresAt).getTime() - now <= QUOTE_EXPIRY_MARGIN_MS;
}

export {canReuseWiseQuote, getWiseQuoteRequest, isPaidWithoutWiseQuote, isWiseQuoteExpired};
