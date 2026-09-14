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

/** The snapshot hash expected of every chart on the spend dashboard, taken from its declared query. */
function buildExpectedHashes(filters: InsightsFilters) {
    return Object.fromEntries(
        [SPEND_SPEC.headlineChart, ...SPEND_SPEC.supportingCharts].map((chart) => {
            const declaredQueryJSON = buildSearchQueryJSON(chart.query);
            const isHeadline = chart.graphKey === SPEND_SPEC.headlineChart.graphKey;
            const chartQuery = declaredQueryJSON ? applyInsightsFilters(declaredQueryJSON, filters, isHeadline ? filters.groupBy : undefined) : undefined;

            return [chart.graphKey, {snapshotHash: chartQuery ? buildSearchQueryJSON(chartQuery)?.hash : undefined}];
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
        it('keeps what the chart declared and adds the page filters', () => {
            // Given a supporting chart, which declares its own view, grouping, sorting and limit
            const [supportingChart] = SPEND_SPEC.supportingCharts;
            const declaredQueryJSON = buildSearchQueryJSON(supportingChart.query);

            // When the page filters are applied to it
            const filteredQuery = declaredQueryJSON ? applyInsightsFilters(declaredQueryJSON, FILTERS) : undefined;

            // Then the chart keeps everything it declared and gains the filters
            const filteredQueryJSON = filteredQuery ? buildSearchQueryJSON(filteredQuery) : undefined;
            expect(filteredQueryJSON?.view).toBe(declaredQueryJSON?.view);
            expect(filteredQueryJSON?.groupBy).toBe(declaredQueryJSON?.groupBy);
            expect(filteredQueryJSON?.sortBy).toBe(declaredQueryJSON?.sortBy);
            expect(filteredQueryJSON?.limit).toBe(declaredQueryJSON?.limit);
            expect(filteredQuery).toContain(`${CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY}:${FILTERS.groupCurrency}`);
            expect(filteredQuery).toContain(FILTERS.datePreset);
        });

        it('replaces the declared group-by when one is passed', () => {
            // Given the headline chart, which declares a group-by of its own
            const declaredQueryJSON = buildSearchQueryJSON(SPEND_SPEC.headlineChart.query);
            expect(declaredQueryJSON?.groupBy).not.toBe(CONST.SEARCH.GROUP_BY.QUARTER);

            // When the filters group by quarter instead
            const filteredQuery = declaredQueryJSON ? applyInsightsFilters(declaredQueryJSON, FILTERS, CONST.SEARCH.GROUP_BY.QUARTER) : undefined;

            // Then the chart is grouped by quarter
            expect(filteredQuery ? buildSearchQueryJSON(filteredQuery)?.groupBy : undefined).toBe(CONST.SEARCH.GROUP_BY.QUARTER);
        });
    });
});
