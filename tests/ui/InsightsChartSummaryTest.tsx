import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import InsightsChartSummary from '@pages/Insights/charts/InsightsChartSummary';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsHeadlineSummary} from '@src/types/onyx/InsightsDashboard';

import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

function renderSummary(summary: InsightsHeadlineSummary, shouldShowChange = false) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <InsightsChartSummary
                summary={summary}
                currency={CONST.CURRENCY.USD}
                shouldShowChange={shouldShowChange}
            />
        </ComposeProviders>,
    );
}

describe('Insights chart summary', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        await waitForBatchedUpdatesWithAct();
    });

    afterAll(() => Onyx.clear());

    it('omits the average when the expense count is zero', async () => {
        // Given a spend summary with no expenses
        const summary = {current: {total: 0, expenseCount: 0}};

        // When the summary receives those totals
        renderSummary(summary);
        await waitForBatchedUpdatesWithAct();

        // Then the total and count still render, but there is no average to show
        expect(screen.getByText('$0.00')).toBeOnTheScreen();
        expect(screen.getByText('0 expenses')).toBeOnTheScreen();
        expect(screen.queryByText(/average/)).not.toBeOnTheScreen();
    });

    it('shows a localized average and labels the comparison with its direction', async () => {
        // Given spending fell from $200 to $100 across two expenses
        const summary = {current: {total: 10000, expenseCount: 2}, previous: {total: 20000, expenseCount: 4}};

        // When the user compares against the previous period
        renderSummary(summary, true);
        await waitForBatchedUpdatesWithAct();

        // Then the breakdown uses a bullet and the comparison exposes its direction in the accessible label
        expect(screen.getByText('2 expenses • $50.00 average')).toBeOnTheScreen();
        expect(screen.getByText('50% vs previous period', {includeHiddenElements: true})).toBeOnTheScreen();
        expect(screen.getByRole('group', {name: 'Down 50% vs previous period'})).toBeOnTheScreen();
    });

    it.each([
        {violations: 1, flaggedExpenses: 1, headline: '1 violation', breakdown: 'On 1 expense'},
        {violations: 1628, flaggedExpenses: 521, headline: '1,628 violations', breakdown: 'On 521 expenses'},
    ])('shows $headline with the count of flagged expenses', async ({violations, flaggedExpenses, headline, breakdown}) => {
        // Given the Compliance totals include both flagged and eligible expenses
        const summary = {current: {violations, flaggedExpenses, eligibleExpenses: 1000}};

        // When the Compliance summary renders
        renderSummary(summary);
        await waitForBatchedUpdatesWithAct();

        // Then the headline names the unit and the breakdown shows only the flagged count
        expect(screen.getByText(headline)).toBeOnTheScreen();
        expect(screen.getByText(breakdown)).toBeOnTheScreen();
    });
});
