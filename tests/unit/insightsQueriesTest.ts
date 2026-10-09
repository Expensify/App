import type {SearchCompareMode} from '@components/Search/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import type {InsightsQuery} from '@pages/Insights/insightsQueries';
import buildInsightsJsonQuery, {applyInsightsFilters, buildInsightsQueryString} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';

const FILTERS: InsightsFilters = {
    date: {preset: CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE},
    policyIDs: [],
    groupBy: CONST.SEARCH.GROUP_BY.MONTH,
    groupCurrency: 'USD',
};

const SPEND_SPEC = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND];

type InsightsPayload = {
    hash: number;
    inputQuery: string;
};

/** Reads back the payload a built request sends to the backend. */
function parsePayload(request: InsightsQuery | undefined): InsightsPayload | undefined {
    if (!request) {
        return undefined;
    }

    const payload: unknown = JSON.parse(request.jsonQuery);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return payload as InsightsPayload;
}

/** The snapshot hashes expected of every chart on the spend dashboard, taken from what the chart declares. */
function buildExpectedHashes(filters: InsightsFilters) {
    return Object.fromEntries(
        [SPEND_SPEC.headlineChart, ...SPEND_SPEC.supportingCharts].map((chart) => {
            const getHashOf = (compare?: SearchCompareMode) => buildSearchQueryJSON(applyInsightsFilters(chart, filters, compare))?.hash;
            return [
                chart.graphKey,
                {snapshotHash: getHashOf(), previousPeriodSnapshotHash: getHashOf(CONST.SEARCH.COMPARE.PREVIOUS_PERIOD), averageSnapshotHash: getHashOf(CONST.SEARCH.COMPARE.AVERAGE)},
            ];
        }),
    );
}

describe('insightsQueries', () => {
    describe('buildInsightsJsonQuery', () => {
        it('builds one request covering every chart on the dashboard', () => {
            // Given the spend dashboard, grouped by month
            const filters: InsightsFilters = {...FILTERS, groupBy: CONST.SEARCH.GROUP_BY.MONTH};

            // When its request is built
            const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, true);

            // Then it is addressed to the spend dashboard and names the snapshot each chart's data belongs in
            const payload = parsePayload(request);
            const queryJSON = payload?.inputQuery ? buildSearchQueryJSON(payload.inputQuery) : undefined;
            expect(payload).toEqual({
                hash: queryJSON?.hash,
                searchKey: CONST.INSIGHTS.SEARCH_KEY.SPEND,
                inputQuery: payload?.inputQuery,
                groupBy: filters.groupBy,
                filters: queryJSON?.filters,
                insightsHashes: buildExpectedHashes(filters),
                numberOfPeriods: 1,
            });
        });

        it('sends the same request whether or not the dashboard is compared', () => {
            // Given the spend dashboard shown on its own
            const standalone = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, FILTERS, true);

            // When it is compared against the previous period
            const filters: InsightsFilters = {...FILTERS, compare: CONST.SEARCH.COMPARE.PREVIOUS_PERIOD};
            const compared = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, true);

            // Then every response carries all comparisons, so switching one never fetches again or stores the response apart
            expect(compared).toEqual(standalone);
        });

        it('requests only the current period for users without the compare beta', () => {
            // Given the spend dashboard for a user who can't compare it
            const filters: InsightsFilters = {...FILTERS, groupBy: CONST.SEARCH.GROUP_BY.MONTH};

            // When its request is built without comparisons
            const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, false);

            // Then each chart names only its own snapshot, so the backend doesn't compute periods nobody sees
            const payload = parsePayload(request);
            const expectedHashes = Object.fromEntries(
                [SPEND_SPEC.headlineChart, ...SPEND_SPEC.supportingCharts].map((chart) => [chart.graphKey, {snapshotHash: buildSearchQueryJSON(applyInsightsFilters(chart, filters))?.hash}]),
            );
            expect(payload).toMatchObject({insightsHashes: expectedHashes});
            expect(payload).not.toHaveProperty('numberOfPeriods');
            expect(request?.snapshotHashes).toEqual(Object.values(expectedHashes).map(({snapshotHash}) => snapshotHash));
        });

        it('hashes every set of filters on its own', () => {
            // Given the spend dashboard grouped by month
            const monthly = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, FILTERS, true);

            // When the same dashboard is grouped by quarter instead
            const quarterly = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, {...FILTERS, groupBy: CONST.SEARCH.GROUP_BY.QUARTER}, true);

            // Then each request carries the hash of the query it asks for, so the two responses are stored apart
            expect(monthly?.hash).toBe(parsePayload(monthly)?.hash);
            expect(quarterly?.hash).not.toBe(monthly?.hash);
        });

        it('asks for nothing the page filters did not set', () => {
            // Given the spend dashboard filtered to the year to date, in USD, for one workspace
            const filters: InsightsFilters = {...FILTERS, policyIDs: ['A1'], groupBy: CONST.SEARCH.GROUP_BY.MONTH, groupCurrency: 'USD'};

            // When its request is built
            const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, true);

            // Then the query carries those filters and nothing else, such as the sorting of a table no chart renders
            expect(parsePayload(request)?.inputQuery).toBe('groupBy:month groupCurrency:USD policyID:A1 date:year-to-date');
        });

        it('reports on a date range as well as a preset', () => {
            // Given a dashboard filtered to a range rather than a preset
            const filters: InsightsFilters = {
                ...FILTERS,
                date: {from: '2026-01-01', to: '2026-03-31'},
            };

            // When its request is built
            const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, true);

            // Then the query is bounded by the range, both ends included, and the charts ask for snapshots of it
            expect(parsePayload(request)?.inputQuery).toBe('groupBy:month groupCurrency:USD date>=2026-01-01 date<=2026-03-31');
            expect(parsePayload(request)).toEqual(expect.objectContaining({insightsHashes: buildExpectedHashes(filters)}));
        });

        it('reports on a single day', () => {
            // Given a dashboard filtered to one day rather than a preset
            const filters: InsightsFilters = {...FILTERS, date: {on: '2026-03-04'}};

            // When its request is built
            const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, true);

            // Then the query names that day the same way it names a preset, grouped by day since a single date offers no grouping to pick
            expect(parsePayload(request)?.inputQuery).toBe('groupBy:day groupCurrency:USD date:2026-03-04');
            expect(parsePayload(request)).toEqual(expect.objectContaining({insightsHashes: buildExpectedHashes(filters)}));
        });
        it('leaves the workspaces out of the query until some are selected', () => {
            // Given a dashboard requested with no workspace selected
            const allWorkspaces = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, FILTERS, true);

            // When two workspaces are selected
            const filters: InsightsFilters = {...FILTERS, policyIDs: ['A1', 'B2']};
            const twoWorkspaces = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, true);

            // Then only the second query names them, and its charts point at different snapshots
            expect(parsePayload(allWorkspaces)?.inputQuery).not.toContain('policyID');
            expect(parsePayload(twoWorkspaces)?.inputQuery).toContain('policyID:A1,B2');
            expect(parsePayload(twoWorkspaces)).toEqual(expect.objectContaining({insightsHashes: buildExpectedHashes(filters)}));
        });
    });

    describe('buildInsightsQueryString', () => {
        it('builds the query the dashboard is requested with, so the stored selections and the request cannot drift', () => {
            // Given a dashboard filtered to a workspace and a custom range
            const filters: InsightsFilters = {...FILTERS, policyIDs: ['A1'], date: {from: '2026-01-01', to: '2026-03-31'}};

            // When the dashboard's query string is built on its own
            const queryString = buildInsightsQueryString(filters);

            // Then it is the very query the request carries
            expect(queryString).toBe(parsePayload(buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, true))?.inputQuery);
        });
    });

    describe('applyInsightsFilters', () => {
        it('keeps what the chart declares and adds the page filters', () => {
            // Given a supporting chart, which declares its own view, grouping, sorting and limit
            const [supportingChart] = SPEND_SPEC.supportingCharts;

            // When the page filters are applied to it
            const chartQuery = applyInsightsFilters(supportingChart, FILTERS);

            // Then the query keeps everything the chart declared and carries the filters as well
            const chartQueryJSON = buildSearchQueryJSON(chartQuery);
            expect(chartQueryJSON?.view).toBe(supportingChart.view);
            expect(chartQueryJSON?.groupBy).toBe(supportingChart.groupBy);
            expect(chartQueryJSON?.sortBy).toBe(supportingChart.sortBy);
            expect(chartQueryJSON?.limit).toBe(supportingChart.limit);
            expect(chartQuery).toContain(`${CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY}:${FILTERS.groupCurrency}`);
            expect(chartQuery).toContain(`${CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE}:${CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE}`);
        });

        it('caps every bar and pie chart, and so its inline table, to the top search limit', () => {
            // Given the charts that list their groups in an inline table below them
            const chartsWithTable = SPEND_SPEC.supportingCharts.filter((chart) => chart.view === CONST.SEARCH.VIEW.BAR || chart.view === CONST.SEARCH.VIEW.PIE);
            expect(chartsWithTable.length).toBeGreaterThan(0);

            // When the page filters are applied to each of them
            const limits = chartsWithTable.map((chart) => buildSearchQueryJSON(applyInsightsFilters(chart, FILTERS))?.limit);

            // Then every query asks the backend for at most the top search limit, which is all the chart and its table show
            expect(limits).toEqual(chartsWithTable.map(() => CONST.SEARCH.TOP_SEARCH_LIMIT));
        });

        it('groups a chart that declares no group-by the way the page filters do', () => {
            // Given the headline chart, which declares no group-by of its own
            const {headlineChart} = SPEND_SPEC;
            expect(headlineChart.groupBy).toBeUndefined();

            // When the page filters group by quarter
            const chartQuery = applyInsightsFilters(headlineChart, {...FILTERS, groupBy: CONST.SEARCH.GROUP_BY.QUARTER});

            // Then the chart is grouped by quarter
            expect(buildSearchQueryJSON(chartQuery)?.groupBy).toBe(CONST.SEARCH.GROUP_BY.QUARTER);
        });

        it('groups the headline chart by day while supporting charts keep their own group-by', () => {
            // Given the page filters grouped by day
            const filters: InsightsFilters = {...FILTERS, groupBy: CONST.SEARCH.GROUP_BY.DAY};

            // When the filters are applied to the headline chart and to every supporting chart
            const headlineQuery = applyInsightsFilters(SPEND_SPEC.headlineChart, filters);
            const supportingGroupBys = SPEND_SPEC.supportingCharts.map((chart) => buildSearchQueryJSON(applyInsightsFilters(chart, filters))?.groupBy);

            // Then only the headline chart, which declares no group-by, is grouped by day
            expect(buildSearchQueryJSON(headlineQuery)?.groupBy).toBe(CONST.SEARCH.GROUP_BY.DAY);
            expect(supportingGroupBys).toEqual(SPEND_SPEC.supportingCharts.map((chart) => chart.groupBy));
        });

        it('groups the headline chart by day on a single date, whatever grouping is saved', () => {
            // Given the page filters saved as quarterly and narrowed to a single date
            const filters: InsightsFilters = {...FILTERS, date: {on: '2026-03-04'}, groupBy: CONST.SEARCH.GROUP_BY.QUARTER};

            // When the filters are applied to the headline chart
            const headlineQuery = applyInsightsFilters(SPEND_SPEC.headlineChart, filters);

            // Then its one point is grouped by day, so it's labeled with the date rather than the quarter
            expect(buildSearchQueryJSON(headlineQuery)?.groupBy).toBe(CONST.SEARCH.GROUP_BY.DAY);
        });
    });
});
