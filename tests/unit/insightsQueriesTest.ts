import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import buildInsightsJsonQuery, {applyInsightsFilters} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';

const FILTERS: InsightsFilters = {
    datePreset: CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE,
    policyIDs: [],
    groupBy: CONST.SEARCH.GROUP_BY.MONTH,
    groupCurrency: 'USD',
};

const SPEND_SPEC = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND];

/** The snapshot hash expected of every chart on the spend dashboard, taken from what the chart declares. */
function buildExpectedHashes(filters: InsightsFilters) {
    return Object.fromEntries(
        [SPEND_SPEC.headlineChart, ...SPEND_SPEC.supportingCharts].map((chart) => {
            const isHeadline = chart.graphKey === SPEND_SPEC.headlineChart.graphKey;
            const chartQuery = applyInsightsFilters(chart, filters, isHeadline ? filters.groupBy : undefined);

            return [chart.graphKey, {snapshotHash: buildSearchQueryJSON(chartQuery)?.hash}];
        }),
    );
}

describe('insightsQueries', () => {
    describe('buildInsightsJsonQuery', () => {
        it('builds one request covering every chart on the dashboard', () => {
            // Given the spend dashboard, grouped by month
            const filters: InsightsFilters = {...FILTERS, groupBy: CONST.SEARCH.GROUP_BY.MONTH};

            // When its request is built
            const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters);

            // Then it is addressed to the spend dashboard and names the snapshot each chart's data belongs in
            const queryJSON = request?.queryString ? buildSearchQueryJSON(request.queryString) : undefined;
            expect(request?.jsonQuery ? JSON.parse(request.jsonQuery) : undefined).toEqual({
                searchKey: CONST.SEARCH.INSIGHTS_SEARCH_KEYS.SPEND,
                inputQuery: request?.queryString,
                groupBy: filters.groupBy,
                filters: queryJSON?.filters,
                insightsHashes: buildExpectedHashes(filters),
            });
        });

        it('asks for nothing the page filters did not set', () => {
            // Given the spend dashboard filtered to the year to date, in USD, for one workspace
            const filters: InsightsFilters = {...FILTERS, policyIDs: ['A1'], groupBy: CONST.SEARCH.GROUP_BY.MONTH, groupCurrency: 'USD'};

            // When its request is built
            const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters);

            // Then the query carries those filters and nothing else, such as the sorting of a table no chart renders
            expect(request?.queryString).toBe('groupBy:month groupCurrency:USD policyID:A1 date:year-to-date');
        });

        it('leaves the workspaces out of the query until some are selected', () => {
            // Given a dashboard requested with no workspace selected
            const allWorkspaces = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, FILTERS);

            // When two workspaces are selected
            const filters: InsightsFilters = {...FILTERS, policyIDs: ['A1', 'B2']};
            const twoWorkspaces = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters);

            // Then only the second query names them, and its charts point at different snapshots
            expect(allWorkspaces?.queryString).not.toContain('policyID');
            expect(twoWorkspaces?.queryString).toContain('policyID:A1,B2');
            expect(twoWorkspaces?.jsonQuery ? JSON.parse(twoWorkspaces.jsonQuery) : undefined).toEqual(expect.objectContaining({insightsHashes: buildExpectedHashes(filters)}));
        });
    });

    describe('applyInsightsFilters', () => {
        it('plots what the chart declares, narrowed by the page filters', () => {
            // Given a supporting chart, which declares its own view, grouping, sorting and limit
            const [supportingChart] = SPEND_SPEC.supportingCharts;

            // When the page filters are applied to it
            const chartQuery = applyInsightsFilters(supportingChart, FILTERS);

            // Then the chart plots what it declared, over the filtered expenses
            const chartQueryJSON = buildSearchQueryJSON(chartQuery);
            expect(chartQueryJSON?.view).toBe(supportingChart.view);
            expect(chartQueryJSON?.groupBy).toBe(supportingChart.groupBy);
            expect(chartQueryJSON?.sortBy).toBe(supportingChart.sortBy);
            expect(chartQueryJSON?.limit).toBe(supportingChart.limit);
            expect(chartQuery).toContain(`${CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY}:${FILTERS.groupCurrency}`);
            expect(chartQuery).toContain(FILTERS.datePreset);
        });

        it('replaces the declared group-by when one is passed', () => {
            // Given the headline chart, which declares a group-by of its own
            const {headlineChart} = SPEND_SPEC;
            expect(headlineChart.groupBy).not.toBe(CONST.SEARCH.GROUP_BY.QUARTER);

            // When the filters group by quarter instead
            const chartQuery = applyInsightsFilters(headlineChart, FILTERS, CONST.SEARCH.GROUP_BY.QUARTER);

            // Then the chart is grouped by quarter
            expect(buildSearchQueryJSON(chartQuery)?.groupBy).toBe(CONST.SEARCH.GROUP_BY.QUARTER);
        });
    });
});
