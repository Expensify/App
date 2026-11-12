import {canReuseWiseQuote, getWiseQuoteRequest} from '@libs/WiseQuoteUtils';

import CONST from '@src/CONST';
import type {Report, WiseQuote} from '@src/types/onyx';

const NOW = new Date('2026-11-06T16:00:00Z').getTime();

const wiseQuote: WiseQuote = {
    wiseQuoteID: 'quote',
    fee: 10,
    rate: 0.86,
    debitedAmount: 1010,
    creditedAmount: 860,
    currency: CONST.CURRENCY.USD,
    paymentCurrency: CONST.CURRENCY.EUR,
    expectedDate: '2026-11-09',
    expiresAt: '2026-11-06T16:20:00Z',
};

const report: Report = {
    reportID: '1',
    currency: CONST.CURRENCY.USD,
    total: -1000,
    reimbursableTotal: -1000,
    nonReimbursableTotal: 0,
    unheldReimbursableTotal: -400,
    wiseQuote,
    wiseQuoteRequest: {full: true, amount: 1000},
};

describe('WiseQuoteUtils', () => {
    describe('getWiseQuoteRequest', () => {
        it('asks for the reimbursable amount, or only the part not on hold', () => {
            // Given a report with $10.00 reimbursable, of which $4.00 is not on hold
            // When the request is built for a full payment and for the unheld part
            // Then each asks for the amount that payment sends
            expect(getWiseQuoteRequest(report, true)).toEqual({full: true, amount: 1000});
            expect(getWiseQuoteRequest(report, false)).toEqual({full: false, amount: 400});
        });
    });

    describe('canReuseWiseQuote', () => {
        it('reuses a quote asked for the same payment that is valid for 20 more minutes', () => {
            // Given a quote for paying the whole report, valid for 20 more minutes
            // When the admin pays the whole report again
            // Then the saved quote is shown right away instead of asking Wise for a new one
            expect(canReuseWiseQuote(report, true, NOW)).toBe(true);
        });

        it('asks for a new quote when the saved one expires within 5 minutes', () => {
            // Given a quote that expires in 4 minutes
            const expiringReport = {...report, wiseQuote: {...wiseQuote, expiresAt: '2026-11-06T16:04:00Z'}};

            // When the admin pays the report
            // Then a new quote is fetched, so the shown price doesn't expire while the admin reviews it
            expect(canReuseWiseQuote(expiringReport, true, NOW)).toBe(false);
        });

        it('asks for a new quote when the admin pays only the expenses not on hold', () => {
            // Given a quote for paying the whole report
            // When the admin pays only the part not on hold
            // Then a new quote is fetched, since Wise priced a different amount
            expect(canReuseWiseQuote(report, false, NOW)).toBe(false);
        });

        it('asks for a new quote when the report total changed after the quote', () => {
            // Given a quote for $10.00, and an expense edited afterwards so the report is $12.00
            const editedReport = {...report, total: -1200, reimbursableTotal: -1200};

            // When the admin pays the report
            // Then a new quote is fetched, since the saved one prices the old amount
            expect(canReuseWiseQuote(editedReport, true, NOW)).toBe(false);
        });

        it('asks for a new quote when the last request failed', () => {
            // Given a saved quote and an error from the last quote request
            const failedReport = {...report, errorFields: {wiseQuote: {[NOW]: 'error'}}};

            // When the admin pays the report
            // Then a new quote is fetched instead of showing the error again
            expect(canReuseWiseQuote(failedReport, true, NOW)).toBe(false);
        });
    });
});
