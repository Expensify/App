import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import WiseQuotePaymentSummary from '@components/WisePaymentSummary/components/WiseQuotePaymentSummary';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
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

function renderSummary(isQuoteRequired: boolean) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <WiseQuotePaymentSummary
                reportID={searchReport.reportID}
                searchReport={searchReport}
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
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${searchReport.reportID}`, {
            wiseQuote: {
                wiseQuoteID: 'quote',
                fee: 412,
                rate: 0.8623,
                debitedAmount: 15962,
                creditedAmount: 13409,
                currency: CONST.CURRENCY.USD,
                paymentCurrency: 'EUR',
                expectedDate: '2026-11-09',
                expiresAt: '2026-11-06T17:00:00Z',
            },
        });
        renderSummary(true);
        await waitForBatchedUpdatesWithAct();

        // Then the card keeps the report from Search and fills in the quote
        expect(screen.getByText(searchReport.reportName ?? '')).toBeTruthy();
        expect(screen.getByText('$159.62')).toBeTruthy();
    });
});
