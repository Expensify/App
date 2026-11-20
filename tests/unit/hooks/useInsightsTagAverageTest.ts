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

const chart = INSIGHTS_DASHBOARD_SPECS.spend.supportingCharts.find((item) => item.graphKey === CONST.INSIGHTS.GRAPH.TOP_TAGS);
const queryJSON = buildSearchQueryJSON('groupBy:tag tagLevel:2 limit:5');
const averageQueryJSON = buildSearchQueryJSON('groupBy:tag tagLevel:2 limit:5 compare:average');
const filters: InsightsFilters = {date: {preset: CONST.SEARCH.DATE_PRESETS.LAST_MONTH}, policyIDs: [], groupCurrency: 'USD', groupBy: 'month', tagLevel: 2, compare: 'average'};
const currentRows: GroupedItem[] = [{groupedBy: 'tag', keyForList: 'group_us', tag: 'Marketing', tagLevel: 2, parentTagPath: 'US', count: 1, total: 100, currency: 'USD', transactions: []}];
const averageRows = currentRows.map((item) => ({...item, total: 50}));

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

describe('Top tags average comparison', () => {
    it('compares each tag with its own average snapshot rather than the all-tag average total', () => {
        // Given current and historical rows for the same dependent tag
        const snapshot = makeSnapshot(queryJSON);
        const averageSnapshot = makeSnapshot(averageQueryJSON);
        jest.mocked(useGroupedItems).mockImplementation((value) => (value === snapshot ? currentRows : averageRows));
        if (!chart) {
            throw new Error('Missing Top tags spec');
        }

        // When Average is selected
        const {result} = renderHook(() =>
            useInsightsChartData({chart, queryJSON, snapshot, averageQueryJSON, averageSnapshot, average: {[CONST.SEARCH.CHART_METRIC.AMOUNT]: 99999}, isDashboardLoaded: true}, filters),
        );

        // Then the comparison retains parent-specific rows instead of drawing a shared average line
        expect(result.current.state).toBe('ready');
        expect(result.current.comparison).toMatchObject({data: averageRows});
        expect(result.current.comparison).not.toHaveProperty('total');
    });

    it('waits for the historical snapshot instead of showing a ready unpaired comparison', () => {
        // Given a loaded current chart with no historical snapshot yet
        jest.mocked(useGroupedItems).mockReturnValue(currentRows);
        if (!chart) {
            throw new Error('Missing Top tags spec');
        }

        // When Average is selected before the compared data arrives
        const {result} = renderHook(() => useInsightsChartData({chart, queryJSON, snapshot: makeSnapshot(queryJSON), averageQueryJSON, averageSnapshot: undefined}, filters));

        // Then the chart waits without borrowing another level's comparison data
        expect(result.current.state).toBe('loading');
        expect(result.current.comparison).toBeUndefined();
    });
});
