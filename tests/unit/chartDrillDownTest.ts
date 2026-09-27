import {buildChartDrillDownQuery, buildViewOnSpendQuery} from '@components/Search/chartDrillDown';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

const RANKING_QUERY = 'type:expense groupBy:from view:bar sortBy:groupTotal sortOrder:desc limit:10 groupCurrency:USD date>2026-01-01 date<2026-03-31';
const TIME_QUERY = 'type:expense groupBy:month view:line groupCurrency:USD date>2026-01-01 date<2026-03-31';

describe('chartDrillDown', () => {
    describe('buildChartDrillDownQuery', () => {
        it('opens a ranking point as its own expenses, keeping the page filters', () => {
            // Given a ranking chart and the member whose slice was clicked
            const queryJSON = buildSearchQueryJSON(RANKING_QUERY);

            // When the drill-down query is built
            const query = queryJSON ? buildChartDrillDownQuery(queryJSON, 'from:1234') : undefined;

            // Then it lists that member's expenses over the same period, ungrouped and sorted by date
            const drillDownJSON = query ? buildSearchQueryJSON(query) : undefined;
            expect(drillDownJSON?.groupBy).toBeUndefined();
            expect(drillDownJSON?.view).toBe(CONST.SEARCH.VIEW.TABLE);
            expect(drillDownJSON?.sortBy).toBe(CONST.SEARCH.TABLE_COLUMNS.DATE);
            expect(drillDownJSON?.sortOrder).toBe(CONST.SEARCH.SORT_ORDER.DESC);
            expect(query).toContain('from:1234');
            expect(query).toContain('groupCurrency:USD');
        });

        it('lists every expense behind the point, not as many as the chart plotted bars', () => {
            // Given a ranking chart limited to its ten highest members
            const queryJSON = buildSearchQueryJSON(RANKING_QUERY);
            expect(queryJSON?.limit).toBe(10);

            // When a member's bar is drilled into
            const query = queryJSON ? buildChartDrillDownQuery(queryJSON, 'from:1234') : undefined;

            // Then the limit is gone
            expect(query ? buildSearchQueryJSON(query)?.limit : undefined).toBeUndefined();
        });

        it('narrows a time-bucketed point to the bucket that was clicked', () => {
            // Given a chart bucketed by month and the bucket that was clicked
            const queryJSON = buildSearchQueryJSON(TIME_QUERY);

            // When the drill-down query is built
            const query = queryJSON ? buildChartDrillDownQuery(queryJSON, 'date>=2026-02-01 date<=2026-02-28') : undefined;

            // Then the bucket's own bounds sit alongside the period the chart plotted, narrowing the query to their overlap
            expect(query).toBe('type:expense sortBy:date sortOrder:desc groupCurrency:USD date>2026-01-01 date<2026-03-31 date>=2026-02-01 date<=2026-02-28');
        });
    });

    describe('buildViewOnSpendQuery', () => {
        it('opens the chart as a table, grouped and sorted the way it was plotted', () => {
            // Given a ranking chart
            const queryJSON = buildSearchQueryJSON(RANKING_QUERY);

            // When the "View on Spend" query is built
            const query = queryJSON ? buildViewOnSpendQuery(queryJSON) : undefined;

            // Then it keeps the grouping and sorting and swaps the chart for a table
            const tableJSON = query ? buildSearchQueryJSON(query) : undefined;
            expect(tableJSON?.view).toBe(CONST.SEARCH.VIEW.TABLE);
            expect(tableJSON?.groupBy).toBe(CONST.SEARCH.GROUP_BY.FROM);
            expect(tableJSON?.sortBy).toBe(CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL);
            expect(tableJSON?.sortOrder).toBe(CONST.SEARCH.SORT_ORDER.DESC);
            expect(tableJSON?.limit).toBeUndefined();
        });
    });
});
