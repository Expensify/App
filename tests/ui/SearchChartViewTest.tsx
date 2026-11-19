import {render} from '@testing-library/react-native';

import {BarChart, PieChart} from '@components/Charts';
import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SearchChartView from '@components/Search/SearchChartView';
import type {GroupedItem} from '@components/Search/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/Charts', () => ({BarChart: jest.fn(() => null), LineChart: jest.fn(() => null), PieChart: jest.fn(() => null)}));
jest.mock('@components/Search/SearchContext', () => ({useSearchQueryContext: () => ({currentSearchKey: undefined})}));

const DATA: GroupedItem[] = ['Marketing', 'Sales'].map((tag) => ({
    groupedBy: CONST.SEARCH.GROUP_BY.TAG,
    tag,
    formattedTag: tag,
    keyForList: tag,
    total: 10000,
    count: 1,
    percentOfTotal: 50,
    currency: CONST.CURRENCY.USD,
    transactions: [],
}));

describe('Search chart single-result fallback', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => Onyx.clear());

    it.each([
        {resultCount: 1, shouldShowSinglePointAsBar: true, expectedView: CONST.SEARCH.VIEW.BAR},
        {resultCount: 2, shouldShowSinglePointAsBar: true, expectedView: CONST.SEARCH.VIEW.PIE},
        {resultCount: 1, shouldShowSinglePointAsBar: false, expectedView: CONST.SEARCH.VIEW.PIE},
    ])('renders $expectedView for $resultCount pie results with fallback=$shouldShowSinglePointAsBar', async ({resultCount, shouldShowSinglePointAsBar, expectedView}) => {
        // Given a pie query with one or multiple tag groups and an optional single-result fallback.
        const data = DATA.slice(0, resultCount);

        // When the shared chart renders the groups.
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
                <SearchChartView
                    queryJSON={undefined}
                    view={CONST.SEARCH.VIEW.PIE}
                    groupBy={CONST.SEARCH.GROUP_BY.TAG}
                    data={data}
                    shouldShowSinglePointAsBar={shouldShowSinglePointAsBar}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then Insights can show a single bar without changing ordinary pie queries or multi-result donuts.
        expect(jest.mocked(BarChart).mock.calls.length > 0).toBe(expectedView === CONST.SEARCH.VIEW.BAR);
        expect(jest.mocked(PieChart).mock.calls.length > 0).toBe(expectedView === CONST.SEARCH.VIEW.PIE);
    });
});
