import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {GroupedItem} from '@components/Search/types';
import WidgetHeaderMenu from '@components/WidgetHeaderMenu';

import localFileDownload from '@libs/localFileDownload';
import {INSIGHTS_CHART_STATE} from '@libs/resolveInsightsChartData';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import InsightsChartWidget from '@pages/Insights/charts/InsightsChartWidget';
import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import useInsightsChartData from '@pages/Insights/useInsightsChartData';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/WidgetHeaderMenu', () => jest.fn(() => null));
jest.mock('@components/Search/SearchChartView', () => jest.fn(() => null));
jest.mock('@libs/localFileDownload', () => jest.fn());
jest.mock('@libs/Navigation/Navigation');
jest.mock('@pages/Insights/useInsightsChartData', () => ({__esModule: true, default: jest.fn()}));

const CHART = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND].headlineChart;
const QUERY = buildSearchQueryJSON('type:expense group-by:month date>=2026-01-01 date<=2026-03-31 group-currency:USD');
const FILTERS: InsightsFilters = {date: {from: '2026-01-01', to: '2026-03-31'}, policyIDs: [], groupBy: CONST.SEARCH.GROUP_BY.MONTH, groupCurrency: CONST.CURRENCY.USD};
const DATA: GroupedItem[] = [
    {
        groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
        year: 2026,
        month: 2,
        keyForList: 'group_february',
        count: 2,
        total: 12345,
        currency: CONST.CURRENCY.USD,
        transactions: [],
        formattedMonth: 'February 2026',
        shortFormattedMonth: 'Feb',
        sortKey: 202602,
    },
];

function renderWidget() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <InsightsChartWidget
                chart={CHART}
                queryJSON={QUERY}
                snapshot={undefined}
                previousPeriodQueryJSON={undefined}
                previousPeriodSnapshot={undefined}
                averageQueryJSON={undefined}
                averageSnapshot={undefined}
                filters={FILTERS}
                insightsScope={{searchKey: INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND].searchKey, policyIDs: [], date: FILTERS.date, groupCurrency: FILTERS.groupCurrency}}
                onRetry={jest.fn()}
            />
        </ComposeProviders>,
    );
}

describe('Insights chart CSV action', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        await waitForBatchedUpdatesWithAct();
        jest.mocked(useInsightsChartData).mockReturnValue({data: DATA, state: INSIGHTS_CHART_STATE.READY, comparison: undefined});
    });

    afterEach(() => Onyx.clear());

    it('offers a local CSV below View on Spend and exports only the current period', async () => {
        // Given a ready chart compared against a different set of totals
        jest.mocked(useInsightsChartData).mockReturnValue({
            data: DATA,
            state: INSIGHTS_CHART_STATE.READY,
            comparison: {data: DATA.map((item) => ({...item, total: 99999})), label: 'Average', color: '#000000'},
        });

        // When the user selects Download CSV
        renderWidget();
        await waitForBatchedUpdatesWithAct();
        const menuItems = jest.mocked(WidgetHeaderMenu).mock.lastCall?.[0].menuItems;
        expect(menuItems?.map((item) => item.text)).toEqual(['View on Spend', 'Download CSV']);
        menuItems?.at(1)?.onSelected?.();

        // Then the existing local download helper receives only grouped current-period values and zero-filled gaps
        expect(localFileDownload).toHaveBeenCalledWith(
            `Expensify-${CHART.graphKey}.csv`,
            '\uFEFFDate,Expenses,Total,Currency\r\n2026-01-01,0,0.00,USD\r\n2026-02-01,2,123.45,USD\r\n2026-03-01,0,0.00,USD',
            expect.any(Function),
        );
    });

    it.each([INSIGHTS_CHART_STATE.LOADING, INSIGHTS_CHART_STATE.EMPTY, INSIGHTS_CHART_STATE.ERROR, INSIGHTS_CHART_STATE.OFFLINE])(
        'hides Download CSV while the chart is %s',
        async (state) => {
            // Given chart data that is not ready to export
            jest.mocked(useInsightsChartData).mockReturnValue({data: [], state, comparison: undefined});

            // When its header is rendered
            renderWidget();
            await waitForBatchedUpdatesWithAct();
            const menuItems = jest.mocked(WidgetHeaderMenu).mock.lastCall?.[0].menuItems ?? [];

            // Then no stale or incomplete data can be downloaded, while View on Spend remains available during loading
            expect(menuItems.map((item) => item.text)).toEqual(state === INSIGHTS_CHART_STATE.LOADING ? ['View on Spend'] : []);
            expect(localFileDownload).not.toHaveBeenCalled();
        },
    );
});
