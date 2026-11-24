import {renderHook} from '@testing-library/react-native';

import useGroupedItems from '@components/Search/hooks/useGroupedItems';
import type {GroupedItem, SearchQueryJSON} from '@components/Search/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import useInsightsChartData from '@pages/Insights/useInsightsChartData';

import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

jest.mock('@components/Search/hooks/useGroupedItems', () => jest.fn());
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

const chart = INSIGHTS_DASHBOARD_SPECS.spend.supportingCharts.find((item) => item.graphKey === CONST.INSIGHTS.GRAPH.TOP_SPENDERS);
const queryJSON = buildSearchQueryJSON('type:expense groupBy:from limit:5');
const filters: InsightsFilters = {date: {preset: CONST.SEARCH.DATE_PRESETS.LAST_MONTH}, policyIDs: [], groupCurrency: 'USD', groupBy: 'month'};

/** Six spenders ranked by spend, as the snapshot holds every group and not only the top five */
const spenders: GroupedItem[] = [1, 2, 3, 4, 5, 6].map((accountID) => ({
    groupedBy: CONST.SEARCH.GROUP_BY.FROM,
    accountID,
    keyForList: String(accountID),
    count: 1,
    total: 1000 - accountID,
    currency: 'USD',
    transactions: [],
}));

function makeSnapshot(query: Readonly<SearchQueryJSON> | undefined): SearchResults {
    return {
        search: {
            offset: 0,
            hash: query?.hash ?? 0,
            type: 'expense',
            sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
            sortOrder: 'desc',
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
            state: CONST.SEARCH.SNAPSHOT_STATE.LOADED,
        },
        data: {},
    };
}

function renderChartData(excludedItemKeys: string[]) {
    if (!chart) {
        throw new Error('Missing Top spenders spec');
    }
    return renderHook(() => useInsightsChartData({chart, queryJSON, snapshot: makeSnapshot(queryJSON)}, filters, excludedItemKeys));
}

describe('useInsightsChartData exclusions', () => {
    beforeEach(() => {
        jest.mocked(useGroupedItems).mockReturnValue(spenders);
    });

    it('moves the next item up when an item in the top five is excluded', () => {
        // Given six spenders with the top one excluded
        // When the chart resolves its rows
        const {result} = renderChartData(['1']);

        // Then the excluded spender is left out before the cap, so the chart still shows five
        expect(result.current.data.map((item) => item.keyForList)).toEqual(['2', '3', '4', '5', '6']);
        expect(result.current.isEveryItemExcluded).toBeUndefined();
    });

    it('says every item is excluded rather than that the chart has no data', () => {
        // Given every spender with data excluded
        // When the chart resolves its rows
        const {result} = renderChartData(['1', '2', '3', '4', '5', '6']);

        // Then nothing is plotted, but the chart knows it has data, so it doesn't show its usual empty state
        expect(result.current.state).toBe('empty');
        expect(result.current.isEveryItemExcluded).toBe(true);
    });
});
