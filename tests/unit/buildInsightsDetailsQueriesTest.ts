import {getChartSpec} from '@pages/Insights/dashboardSpecs';
import buildInsightsDetailsQueries from '@pages/Insights/details/buildInsightsDetailsQueries';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';

import CONST from '@src/CONST';

const FILTERS: InsightsFilters = {date: {preset: CONST.SEARCH.DATE_PRESETS.THIS_YEAR}, policyIDs: [], groupBy: CONST.SEARCH.GROUP_BY.MONTH, groupCurrency: CONST.CURRENCY.USD};
const ITEM = {title: 'Travel', filterQuery: 'category:Travel'};

/** Returns the Top categories chart, which a Biggest changes category row opens */
function getTopCategories() {
    const chartSpec = getChartSpec(CONST.INSIGHTS.DASHBOARD.SPEND, CONST.INSIGHTS.GRAPH.TOP_CATEGORIES, undefined);
    if (!chartSpec) {
        throw new Error('Top categories is missing from the Spend dashboard');
    }
    return chartSpec;
}

describe('buildInsightsDetailsQueries', () => {
    it('narrows an item opened from Biggest changes to the clicked period, keeping its grouping', () => {
        // Given a category opened from Biggest changes for August, on a This year dashboard grouped by month
        // When the panel's requests are built
        const {requestFilters, detailsQuery, topExpensesQueryJSON} = buildInsightsDetailsQueries({
            chartSpec: getTopCategories(),
            filters: FILTERS,
            item: ITEM,
            itemKey: 'Travel',
            periodStart: '2026-08-01',
            periodEnd: '2026-08-31',
            asOf: '2026-11-19',
            biggestChangesGroupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
        });

        // Then August replaces the Date range and is summarized as one month, like the point it was opened from,
        // and Top expenses only lists the category's expenses from August
        expect(requestFilters.date).toEqual({from: '2026-08-01', to: '2026-08-31'});
        expect(detailsQuery?.periodGroupBy).toBe(CONST.SEARCH.GROUP_BY.MONTH);
        expect(detailsQuery?.period).toEqual({start: '2026-08-01', end: '2026-08-31'});
        const dateFilters = topExpensesQueryJSON?.flatFilters.filter(({key}) => key === CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE).flatMap(({filters}) => filters);
        expect(dateFilters?.map(({value}) => value)).toEqual(expect.arrayContaining(['2026-08-01', '2026-08-31']));
    });

    it('keeps the dashboard filters for an item opened from its chart', () => {
        // Given a category opened from Top categories, so the URL carries no period
        // When the panel's requests are built
        const {requestFilters, biggestChangesQuery} = buildInsightsDetailsQueries({
            chartSpec: getTopCategories(),
            filters: FILTERS,
            item: ITEM,
            itemKey: 'Travel',
            periodStart: undefined,
            periodEnd: undefined,
            asOf: '2026-11-19',
            biggestChangesGroupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
        });

        // Then the panel covers the dashboard's Date range, and makes no Biggest changes request since ranking panels don't show it
        expect(requestFilters).toBe(FILTERS);
        expect(biggestChangesQuery).toBeUndefined();
    });
});
