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
const COMPLIANCE_SPEC = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.COMPLIANCE];

type InsightsPayload = {
    hash: number;
    groupBy: string;
    inputQuery: string;
    insightsHashes: Record<string, unknown>;
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
            const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, SPEND_SPEC.supportingCharts);

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

        it('requests Compliance by submission or approval dates without sharing Spend snapshots', () => {
            // Given Spend and Compliance using the same year-to-date picker selections
            const spend = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, FILTERS, []);

            // When Compliance requests its current, previous, and average periods
            const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.COMPLIANCE, FILTERS, []);
            const compared = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.COMPLIANCE, {...FILTERS, compare: CONST.SEARCH.COMPARE.PREVIOUS_PERIOD}, []);

            // Then both action stages use the same bounded period and all snapshots belong to the Compliance graph
            expect(parsePayload(request)).toMatchObject({
                searchKey: CONST.INSIGHTS.SEARCH_KEY.COMPLIANCE,
                filters: {
                    operator: 'and',
                    left: {operator: 'eq', left: 'groupCurrency', right: 'USD'},
                    right: {
                        operator: 'or',
                        left: {operator: 'eq', left: 'anySubmission', right: 'year-to-date'},
                        right: {operator: 'eq', left: 'anyApproval', right: 'year-to-date'},
                    },
                },
                insightsHashes: {
                    violationsOverTime: {
                        snapshotHash: request?.headlineChart.queryJSON?.hash,
                        previousPeriodSnapshotHash: request?.headlineChart.previousPeriodQueryJSON?.hash,
                    },
                },
                numberOfPeriods: 1,
            });
            expect(request?.headlineChart.chart.graphKey).toBe(COMPLIANCE_SPEC.headlineChart.graphKey);
            expect(Object.keys(parsePayload(request)?.insightsHashes ?? {})).toEqual(['violationsOverTime']);
            expect(new Set(request?.snapshotHashes).size).toBe(3);
            expect(request?.hash).not.toBe(spend?.hash);
            for (const hash of request?.snapshotHashes ?? []) {
                expect(spend?.snapshotHashes).not.toContain(hash);
            }
            expect(compared?.hash).toBe(request?.hash);
            expect(compared?.snapshotHashes).toEqual(request?.snapshotHashes);
            expect(parsePayload(request)?.inputQuery).toBe(buildInsightsQueryString(FILTERS));
        });

        it('keeps each Compliance action range bounded and workspace filters outside the OR', () => {
            // Given a custom Compliance period scoped to one workspace
            const filters: InsightsFilters = {...FILTERS, policyIDs: ['A1'], date: {from: '2026-01-01', to: '2026-03-31'}};

            // When its request is built
            const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.COMPLIANCE, filters, []);

            // Then either stage must satisfy both bounds, with no expense-date constraint and all comparison snapshots
            expect(parsePayload(request)).toMatchObject({
                filters: {
                    operator: 'and',
                    left: {
                        operator: 'and',
                        left: {operator: 'eq', left: 'groupCurrency', right: 'USD'},
                        right: {operator: 'eq', left: 'policyID', right: 'A1'},
                    },
                    right: {
                        operator: 'or',
                        left: {
                            operator: 'and',
                            left: {operator: 'gte', left: 'anySubmission', right: '2026-01-01'},
                            right: {operator: 'lte', left: 'anySubmission', right: '2026-03-31'},
                        },
                        right: {
                            operator: 'and',
                            left: {operator: 'gte', left: 'anyApproval', right: '2026-01-01'},
                            right: {operator: 'lte', left: 'anyApproval', right: '2026-03-31'},
                        },
                    },
                },
                insightsHashes: {
                    violationsOverTime: {
                        snapshotHash: request?.headlineChart.queryJSON?.hash,
                        previousPeriodSnapshotHash: request?.headlineChart.previousPeriodQueryJSON?.hash,
                        averageSnapshotHash: request?.snapshotHashes.at(2),
                    },
                },
                numberOfPeriods: 1,
            });
            expect(request?.snapshotHashes).toEqual([request?.headlineChart.queryJSON?.hash, request?.headlineChart.previousPeriodQueryJSON?.hash, expect.any(Number)]);
        });

        it('uses a single selected day for both Compliance action stages', () => {
            // Given Compliance narrowed to one day
            const filters: InsightsFilters = {...FILTERS, date: {on: '2026-03-04'}};

            // When its request is built
            const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.COMPLIANCE, filters, []);

            // Then both stages match that day and the headline uses daily buckets
            expect(parsePayload(request)).toMatchObject({
                groupBy: CONST.SEARCH.GROUP_BY.DAY,
                filters: {
                    right: {
                        operator: 'or',
                        left: {operator: 'eq', left: 'anySubmission', right: '2026-03-04'},
                        right: {operator: 'eq', left: 'anyApproval', right: '2026-03-04'},
                    },
                },
            });
        });

        it('requests the same data whether or not the dashboard is compared, saving the Compare mode along', () => {
            // Given the spend dashboard shown on its own
            const standalone = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, FILTERS, SPEND_SPEC.supportingCharts);

            // When it is compared against the previous period
            const filters: InsightsFilters = {...FILTERS, compare: CONST.SEARCH.COMPARE.PREVIOUS_PERIOD};
            const compared = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, SPEND_SPEC.supportingCharts);

            // Then every response carries all comparisons, so switching one never fetches again or stores the response apart
            expect(compared?.hash).toBe(standalone?.hash);
            expect(compared?.snapshotHashes).toEqual(standalone?.snapshotHashes);

            // And the backend saves the Compare mode with the rest of the filters, so it's restored after signing in again
            expect(parsePayload(compared)?.inputQuery).toBe(buildInsightsQueryString(filters));
            expect(parsePayload(compared)?.inputQuery).toContain(`compare:${CONST.SEARCH.COMPARE.PREVIOUS_PERIOD}`);
        });

        it('requests only the supporting charts shown on the dashboard', () => {
            // Given the spend dashboard with only its first supporting chart shown, as when no workspace in scope is eligible for the rest
            const [shownChart, ...hiddenCharts] = SPEND_SPEC.supportingCharts;

            // When its request is built
            const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, FILTERS, [shownChart]);

            // Then the hidden charts are left out, so the backend doesn't compute graphs nobody sees
            const hiddenChartHashes = hiddenCharts.map((chart) => buildSearchQueryJSON(applyInsightsFilters(chart, FILTERS))?.hash);
            expect(Object.keys(parsePayload(request)?.insightsHashes ?? {})).toEqual([SPEND_SPEC.headlineChart.graphKey, shownChart.graphKey]);
            for (const hash of hiddenChartHashes) {
                expect(request?.snapshotHashes).not.toContain(hash);
            }
            expect(request?.supportingCharts.map(({chart}) => chart)).toEqual([shownChart]);
        });

        it('hashes every set of filters on its own', () => {
            // Given the spend dashboard grouped by month
            const monthly = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, FILTERS, SPEND_SPEC.supportingCharts);

            // When the same dashboard is grouped by quarter instead
            const quarterly = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, {...FILTERS, groupBy: CONST.SEARCH.GROUP_BY.QUARTER}, SPEND_SPEC.supportingCharts);

            // Then each request carries the hash of the query it asks for, so the two responses are stored apart
            expect(monthly?.hash).toBe(parsePayload(monthly)?.hash);
            expect(quarterly?.hash).not.toBe(monthly?.hash);
        });

        it('asks for nothing the page filters did not set', () => {
            // Given the spend dashboard filtered to the year to date, in USD, for one workspace
            const filters: InsightsFilters = {...FILTERS, policyIDs: ['A1'], groupBy: CONST.SEARCH.GROUP_BY.MONTH, groupCurrency: 'USD'};

            // When its request is built
            const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, SPEND_SPEC.supportingCharts);

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
            const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, SPEND_SPEC.supportingCharts);

            // Then the query is bounded by the range, both ends included, and the charts ask for snapshots of it
            expect(parsePayload(request)?.inputQuery).toBe('groupBy:month groupCurrency:USD date>=2026-01-01 date<=2026-03-31');
            expect(parsePayload(request)).toEqual(expect.objectContaining({insightsHashes: buildExpectedHashes(filters)}));
        });

        it('reports on a single day', () => {
            // Given a dashboard filtered to one day rather than a preset
            const filters: InsightsFilters = {...FILTERS, date: {on: '2026-03-04'}};

            // When its request is built
            const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, SPEND_SPEC.supportingCharts);

            // Then the query names that day the same way it names a preset, and its one point is grouped by day, the only grouping a single date offers
            expect(parsePayload(request)?.inputQuery).toBe('groupBy:month groupCurrency:USD date:2026-03-04');
            expect(parsePayload(request)?.groupBy).toBe(CONST.SEARCH.GROUP_BY.DAY);
            expect(parsePayload(request)).toEqual(expect.objectContaining({insightsHashes: buildExpectedHashes(filters)}));
        });

        it('saves the selected grouping while querying the one fitted to the date range', () => {
            // Given a quarterly dashboard narrowed to a month, which only offers Day and Week
            const filters: InsightsFilters = {...FILTERS, date: {from: '2026-03-01', to: '2026-03-31'}, groupBy: CONST.SEARCH.GROUP_BY.QUARTER};

            // When its request is built
            const payload = parsePayload(buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, SPEND_SPEC.supportingCharts));

            // Then the backend saves quarter, so a longer range brings it back, while the charts are grouped by week
            expect(payload?.inputQuery).toBe('groupBy:quarter groupCurrency:USD date>=2026-03-01 date<=2026-03-31');
            expect(payload?.groupBy).toBe(CONST.SEARCH.GROUP_BY.WEEK);
        });

        it('leaves the workspaces out of the query until some are selected', () => {
            // Given a dashboard requested with no workspace selected
            const allWorkspaces = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, FILTERS, SPEND_SPEC.supportingCharts);

            // When two workspaces are selected
            const filters: InsightsFilters = {...FILTERS, policyIDs: ['A1', 'B2']};
            const twoWorkspaces = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, SPEND_SPEC.supportingCharts);

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
            expect(queryString).toBe(parsePayload(buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters, SPEND_SPEC.supportingCharts))?.inputQuery);
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
            // Given the page filters over a month, grouped by day
            const filters: InsightsFilters = {...FILTERS, date: {from: '2026-03-01', to: '2026-03-31'}, groupBy: CONST.SEARCH.GROUP_BY.DAY};

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
