import {canReuseWiseQuote, getWiseQuoteRequest, isWiseQuoteExpired} from '@libs/WiseQuoteUtils';

import CONST from '@src/CONST';
import type {Report, WiseQuote} from '@src/types/onyx';

const NOW = new Date('2026-11-06T16:00:00Z').getTime();
const QUOTED_BANK_ACCOUNT_ID = 1;
const OTHER_BANK_ACCOUNT_ID = 2;

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
    wiseQuoteRequest: {full: true, amount: 1000, bankAccountID: QUOTED_BANK_ACCOUNT_ID},
};

describe('WiseQuoteUtils', () => {
    describe('getWiseQuoteRequest', () => {
        it('asks for the reimbursable amount, or only the part not on hold', () => {
            // Given a report with $10.00 reimbursable, of which $4.00 is not on hold
            // When the request is built for a full payment and for the unheld part
            // Then each asks for the amount that payment sends
            expect(getWiseQuoteRequest(report, true, QUOTED_BANK_ACCOUNT_ID)).toEqual({full: true, amount: 1000, bankAccountID: QUOTED_BANK_ACCOUNT_ID});
            expect(getWiseQuoteRequest(report, false, QUOTED_BANK_ACCOUNT_ID)).toEqual({full: false, amount: 400, bankAccountID: QUOTED_BANK_ACCOUNT_ID});
        });
    });

    describe('canReuseWiseQuote', () => {
        it('reuses a quote asked for the same payment that is valid for 20 more minutes', () => {
            // Given a quote for paying the whole report, valid for 20 more minutes
            // When the admin pays the whole report again
            // Then the saved quote is shown right away instead of asking Wise for a new one
            expect(canReuseWiseQuote(report, getWiseQuoteRequest(report, true, QUOTED_BANK_ACCOUNT_ID), NOW)).toBe(true);
        });

        it('asks for a new quote when the saved one expires within 5 minutes', () => {
            // Given a quote that expires in 4 minutes
            const expiringReport = {...report, wiseQuote: {...wiseQuote, expiresAt: '2026-11-06T16:04:00Z'}};

            // When the admin pays the report
            // Then a new quote is fetched, so the shown price doesn't expire while the admin reviews it
            expect(canReuseWiseQuote(expiringReport, getWiseQuoteRequest(expiringReport, true, QUOTED_BANK_ACCOUNT_ID), NOW)).toBe(false);
        });

        it('asks for a new quote when the admin pays only the expenses not on hold', () => {
            // Given a quote for paying the whole report
            // When the admin pays only the part not on hold
            // Then a new quote is fetched, since Wise priced a different amount
            expect(canReuseWiseQuote(report, getWiseQuoteRequest(report, false, QUOTED_BANK_ACCOUNT_ID), NOW)).toBe(false);
        });

        it('asks for a new quote when the admin pays from another bank account', () => {
            // Given a quote for paying the whole report from one bank account
            // When the admin pays the whole report from another bank account
            // Then a new quote is fetched, since Wise priced the transfer from the first account
            expect(canReuseWiseQuote(report, getWiseQuoteRequest(report, true, OTHER_BANK_ACCOUNT_ID), NOW)).toBe(false);
        });

        it('asks for a new quote when the report total changed after the quote', () => {
            // Given a quote for $10.00, and an expense edited afterwards so the report is $12.00
            const editedReport = {...report, total: -1200, reimbursableTotal: -1200};

            // When the admin pays the report
            // Then a new quote is fetched, since the saved one prices the old amount
            expect(canReuseWiseQuote(editedReport, getWiseQuoteRequest(editedReport, true, QUOTED_BANK_ACCOUNT_ID), NOW)).toBe(false);
        });

        it('asks for a new quote when the last request failed', () => {
            // Given a saved quote and an error from the last quote request
            const failedReport = {...report, errorFields: {wiseQuote: {[NOW]: 'error'}}};

            // When the admin pays the report
            // Then a new quote is fetched instead of showing the error again
            expect(canReuseWiseQuote(failedReport, getWiseQuoteRequest(failedReport, true, QUOTED_BANK_ACCOUNT_ID), NOW)).toBe(false);
        });
    });

    describe('isWiseQuoteExpired', () => {
        it('accepts a quote valid for more than 30 seconds', () => {
            // Given a quote that expires in 31 seconds
            // When the admin pays with it
            // Then the payment goes through with this quote
            expect(isWiseQuoteExpired('2026-11-06T16:00:31Z', NOW)).toBe(false);
        });

        it('treats a quote as expired 30 seconds before its expiry time', () => {
            // Given a quote that expires in 30 seconds, and the device clock can differ from the server's
            // When the admin pays with it
            // Then a new quote is fetched instead, so Wise doesn't reject the payment
            expect(isWiseQuoteExpired('2026-11-06T16:00:30Z', NOW)).toBe(true);
        });

        it('treats a quote past its expiry time as expired', () => {
            // Given a quote that expired a minute ago
            // When the admin pays with it
            // Then a new quote is fetched instead
            expect(isWiseQuoteExpired('2026-11-06T15:59:00Z', NOW)).toBe(true);
        });
    });
});
