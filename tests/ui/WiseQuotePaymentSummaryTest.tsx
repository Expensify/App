import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import WiseQuotePaymentSummary from '@components/WisePaymentSummary/components/WiseQuotePaymentSummary';

import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const searchReport: Report = {
    reportID: '1',
    reportName: 'Expense Report from Search',
    type: CONST.REPORT.TYPE.EXPENSE,
    currency: CONST.CURRENCY.USD,
    total: -15550,
    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
};

const wiseQuote = {
    wiseQuoteID: 'quote',
    fee: 412,
    rate: 0.8623,
    debitedAmount: 15962,
    creditedAmount: 13409,
    currency: CONST.CURRENCY.USD,
    paymentCurrency: 'EUR',
    expectedDate: '2026-11-09',
    expiresAt: '2026-11-06T17:00:00Z',
};

function renderSummary(isQuoteRequired: boolean, report: Report = searchReport) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <WiseQuotePaymentSummary
                reportID={report.reportID}
                searchReport={report}
                isPayingUnheldOnly={false}
                isQuoteRequired={isQuoteRequired}
            />
        </ComposeProviders>,
    );
}

describe('WiseQuotePaymentSummary', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('shows a report that only Search results hold', async () => {
        // Given a report bulk pay read from Search results, with no copy in Onyx, paid without a quote
        renderSummary(false);
        await waitForBatchedUpdatesWithAct();

        // Then its card shows the report and its amount, rather than an empty card
        expect(screen.getByText(searchReport.reportName ?? '')).toBeTruthy();
        expect(screen.getAllByText('$155.50').length).toBeGreaterThan(0);
    });

    it('shows the quote that merges into Onyx on top of a report from Search results', async () => {
        // Given a report from Search results whose only Onyx data is the quote Wise returned
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${searchReport.reportID}`, {wiseQuote});
        renderSummary(true);
        await waitForBatchedUpdatesWithAct();

        // Then the card keeps the report from Search and fills in the quote
        expect(screen.getByText(searchReport.reportName ?? '')).toBeTruthy();
        expect(screen.getByText('$159.62')).toBeTruthy();
    });

    it('shows the loader instead of the quote Search results still hold while a new quote loads', async () => {
        // Given a report from Search results that still holds an earlier quote, while the refetch has cleared the quote in Onyx
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${searchReport.reportID}`, {wiseQuote: null});
        renderSummary(true, {...searchReport, wiseQuote});
        await waitForBatchedUpdatesWithAct();

        // Then the card waits for the new quote instead of showing the old debit amount
        expect(screen.queryByText('$159.62')).toBeNull();
    });

    describe('when Wise refuses the quote', () => {
        // The codes are written the way the server sends them, so a CONST.WISE.QUOTE_ERROR_CODE value that drifts from the server fails here
        async function mergeQuoteFailure(wiseQuoteError?: Report['wiseQuoteError']) {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${searchReport.reportID}`, {
                wiseQuote: null,
                wiseQuoteError,
                errorFields: {wiseQuote: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
            });
        }

        it('shows the most Wise can pay, without decimals when the limit is whole', async () => {
            // Given Wise refused the quote because the amount is above its maximum of £1,000,000
            await mergeQuoteFailure({code: 'maxAmount', limit: 100000000, limitCurrency: 'GBP', paymentCurrency: 'GBP'});

            // When the admin opens the payment summary to pay the report
            renderSummary(true);
            await waitForBatchedUpdatesWithAct();

            // Then the card names the maximum instead of the generic error, so the admin knows to pay another way
            expect(screen.getByText(translateLocal('iou.wisePaymentSummary.amountAboveWiseMaximum', {limit: '£1,000,000'}))).toBeTruthy();
            expect(screen.queryByText(translateLocal('common.genericErrorMessage'))).toBeNull();
        });

        it('shows the least Wise can pay with its decimals when the limit is a fraction of a unit', async () => {
            // Given Wise refused the quote because the amount is below its minimum of £0.01
            await mergeQuoteFailure({code: 'minAmount', limit: 1, limitCurrency: 'GBP', paymentCurrency: 'GBP'});

            // When the admin opens the payment summary to pay the report
            renderSummary(true);
            await waitForBatchedUpdatesWithAct();

            // Then the card shows the minimum as £0.01, since dropping the decimals would round it to £0
            expect(screen.getByText(translateLocal('iou.wisePaymentSummary.amountBelowWiseMinimum', {limit: '£0.01'}))).toBeTruthy();
        });

        it('says the amount is too small when Wise gives no minimum', async () => {
            // Given Wise refused the quote because the amount is too small, without saying what its minimum is
            await mergeQuoteFailure({code: 'minAmount', paymentCurrency: 'GBP'});

            // When the admin opens the payment summary to pay the report
            renderSummary(true);
            await waitForBatchedUpdatesWithAct();

            // Then the card says the amount is too small, since there is no minimum to show
            expect(screen.getByText(translateLocal('iou.wisePaymentSummary.amountTooSmallForWise'))).toBeTruthy();
        });

        it('names the currency Wise cannot send money to', async () => {
            // Given Wise refused the quote because it can't pay a bank account in Kenyan shillings at the moment
            await mergeQuoteFailure({code: 'unavailable', paymentCurrency: 'KES'});

            // When the admin opens the payment summary to pay the report
            renderSummary(true);
            await waitForBatchedUpdatesWithAct();

            // Then the card names the employee's currency, so the admin knows the problem is the corridor and not the amount
            expect(screen.getByText(translateLocal('iou.wisePaymentSummary.paymentUnavailable', {currency: 'KES'}))).toBeTruthy();
        });

        it('shows the generic error when the server gives no reason', async () => {
            // Given the quote failed without a reason, as it does for any failure other than Wise refusing the payment
            await mergeQuoteFailure();

            // When the admin opens the payment summary to pay the report
            renderSummary(true);
            await waitForBatchedUpdatesWithAct();

            // Then the card still shows the generic error, so a failed quote never leaves the card empty
            expect(screen.getByText(translateLocal('common.genericErrorMessage'))).toBeTruthy();
        });

        it('shows the loader instead of a reason Search results still hold while a new quote loads', async () => {
            // Given a report from Search results that still holds the reason an earlier quote failed, while the refetch has cleared it in Onyx
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${searchReport.reportID}`, {wiseQuote: null, wiseQuoteError: null});

            // When bulk pay opens the payment summary from the Search copy of the report
            renderSummary(true, {...searchReport, wiseQuoteError: {code: 'unavailable', paymentCurrency: 'KES'}});
            await waitForBatchedUpdatesWithAct();

            // Then the card waits for the new quote instead of showing the old reason, which may no longer apply
            expect(screen.queryByText(translateLocal('iou.wisePaymentSummary.paymentUnavailable', {currency: 'KES'}))).toBeNull();
        });
    });
});
