import type {SearchCompareMode, SearchGroupBy, SearchQueryJSON, SearchQueryString} from '@components/Search/types';

import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON, getRangeQueryValue} from '@libs/SearchQueryUtils';
import {hashText} from '@libs/UserUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {InsightsDashboard, InsightsDashboardID, InsightsGraphKey} from '@src/types/onyx';

import type {InsightsChartSpec} from './dashboardSpecs';
import type {InsightsFilters} from './insightsFilters';

import INSIGHTS_DASHBOARD_SPECS from './dashboardSpecs';
import {getQueryGroupBy} from './insightsGroupByUtils';

/** How many periods before the selected date range the Average mode spans */
const COMPARE_AVERAGE_PERIOD_COUNT = 1;

/** Builds the date filter in the shape a search query is built from. */
function buildDateFormValues(date: InsightsFilters['date']): Partial<SearchAdvancedFiltersForm> {
    if ('preset' in date) {
        return {dateOn: date.preset};
    }
    if ('on' in date) {
        return {dateOn: date.on};
    }
    return {dateRange: getRangeQueryValue(date.from, date.to)};
}

/** Builds the page's filters in the shape a search query is built from. Leaves the workspaces out when none are selected, which reports on all of them. */
function buildFilterFormValues(filters: InsightsFilters, shouldIncludeDate = true): Partial<SearchAdvancedFiltersForm> {
    return {
        ...(shouldIncludeDate && buildDateFormValues(filters.date)),
        groupCurrency: filters.groupCurrency,
        ...(filters.policyIDs.length > 0 && {policyID: filters.policyIDs}),
    };
}

/** Compliance periods follow actions, while saved picker selections keep the shared date format. */
function buildComplianceFilters(filters: InsightsFilters) {
    const buildStageFilter = (stage: 'anySubmission' | 'anyApproval') => {
        if ('from' in filters.date) {
            return {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
                left: {operator: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO, left: stage, right: filters.date.from},
                right: {operator: CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO, left: stage, right: filters.date.to},
            };
        }

        return {
            operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            left: stage,
            right: 'preset' in filters.date ? filters.date.preset : filters.date.on,
        };
    };
    const actionDates = {
        operator: CONST.SEARCH.SYNTAX_OPERATORS.OR,
        left: buildStageFilter('anySubmission'),
        right: buildStageFilter('anyApproval'),
    };
    const commonFilters = buildSearchQueryJSON(buildQueryStringFromFilterFormValues(buildFilterFormValues(filters, false)))?.filters;

    return commonFilters ? {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: commonFilters, right: actionDates} : actionDates;
}

/** Charts retain picker dates for labels, but Compliance snapshots must not share Spend's cache keys. */
function buildDashboardQuery(query: SearchQueryString, dashboard: InsightsDashboardID): Readonly<SearchQueryJSON> | undefined {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON || dashboard === CONST.INSIGHTS.DASHBOARD.SPEND) {
        return queryJSON;
    }

    return {...queryJSON, hash: hashText(`${dashboard}:${queryJSON.hash}`, 2 ** 32)};
}

/** Builds the dashboard-wide query the whole page is narrowed by. Keeps the grouping the user picked, Running total included, so reopening the dashboard restores it. `getQueryGroupBy` resolves it to a real bucket for the backend request. */
function buildInsightsQueryString(filters: InsightsFilters): SearchQueryString {
    // Running total is a display grouping outside the Search grammar, so it isn't a SearchGroupBy. The serializer writes it verbatim and the Insights parser reads it back.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the serializer accepts any groupBy string, and `parseInsightsFilters` reads `runningTotal` back off the raw query
    return buildQueryStringFromFilterFormValues({...buildFilterFormValues(filters), groupBy: filters.groupBy as SearchGroupBy, compare: filters.compare});
}

/** Builds a chart's query with the page's filters applied. */
function applyInsightsFilters(chart: InsightsChartSpec, filters: InsightsFilters, compare?: SearchCompareMode): SearchQueryString {
    return buildQueryStringFromFilterFormValues(
        {...buildFilterFormValues(filters), groupBy: chart.groupBy ?? getQueryGroupBy(filters), view: chart.view, compare},
        {sortBy: chart.sortBy, sortOrder: chart.sortOrder, limit: chart.limit},
    );
}

type InsightsChartQuery = {
    chart: InsightsChartSpec;
    queryJSON: Readonly<SearchQueryJSON> | undefined;
    previousPeriodQueryJSON?: Readonly<SearchQueryJSON>;
    averageQueryJSON?: Readonly<SearchQueryJSON>;
};

type InsightsGraphHashes = {
    snapshotHash: number;
    previousPeriodSnapshotHash?: number;
    averageSnapshotHash?: number;
};
type InsightsGraphHashEntry = [InsightsGraphKey, InsightsGraphHashes];

/** Returns the chart's graph slot paired with the hashes its current period, previous period and average are stored under. */
function buildSnapshotHashEntry({chart, queryJSON, previousPeriodQueryJSON, averageQueryJSON}: InsightsChartQuery): InsightsGraphHashEntry | undefined {
    const snapshotHash = queryJSON?.hash;
    if (!snapshotHash) {
        return undefined;
    }
    const previousPeriodSnapshotHash = previousPeriodQueryJSON?.hash;
    const averageSnapshotHash = averageQueryJSON?.hash;
    if (!previousPeriodSnapshotHash || !averageSnapshotHash) {
        return undefined;
    }

    return [chart.graphKey, {snapshotHash, previousPeriodSnapshotHash, averageSnapshotHash}];
}

type InsightsQuery = {
    /** Request payload for GetInsights. */
    jsonQuery: string;

    /** Hash of the dashboard-wide query, which the response is stored under so every set of filters keeps its own dashboard entry. Leaves out the comparison, since every response carries all of them. */
    hash: number;

    /** Hashes of the snapshots the graphs are stored under. */
    snapshotHashes: number[];

    headlineChart: InsightsChartQuery;
    supportingCharts: InsightsChartQuery[];
};

/** Builds one request for the dashboard's headline chart and the given supporting charts, naming each graph's snapshots by its chart's query hashes, and returns those chart queries to read the snapshots back with. */
function buildInsightsJsonQuery(dashboard: InsightsDashboardID, filters: InsightsFilters, supportingChartSpecs: InsightsChartSpec[]): InsightsQuery | undefined {
    // The backend saves inputQuery as the dashboard's filters, so it keeps the Group by the user picked, not the one fitted to the date range
    const inputQuery = buildInsightsQueryString(filters);
    const queryJSON = buildDashboardQuery(buildInsightsQueryString({...filters, groupBy: getQueryGroupBy(filters), compare: undefined}), dashboard);
    if (!queryJSON) {
        return undefined;
    }

    const spec = INSIGHTS_DASHBOARD_SPECS[dashboard];
    const buildChartQuery = (chart: InsightsChartSpec): InsightsChartQuery => ({
        chart,
        queryJSON: buildDashboardQuery(applyInsightsFilters(chart, filters), dashboard),
        previousPeriodQueryJSON: buildDashboardQuery(applyInsightsFilters(chart, filters, CONST.SEARCH.COMPARE.PREVIOUS_PERIOD), dashboard),
        averageQueryJSON: buildDashboardQuery(applyInsightsFilters(chart, filters, CONST.SEARCH.COMPARE.AVERAGE), dashboard),
    });
    const headlineChart = buildChartQuery(spec.headlineChart);
    const supportingCharts = supportingChartSpecs.map(buildChartQuery);
    const graphEntries = [headlineChart, ...supportingCharts].map(buildSnapshotHashEntry).filter((entry): entry is InsightsGraphHashEntry => !!entry);
    const insightsHashes: InsightsDashboard['graphs'] = Object.fromEntries(graphEntries);

    return {
        jsonQuery: JSON.stringify({
            hash: queryJSON.hash,
            groupBy: queryJSON.groupBy,
            filters: dashboard === CONST.INSIGHTS.DASHBOARD.COMPLIANCE ? buildComplianceFilters(filters) : queryJSON.filters,
            inputQuery,
            searchKey: spec.searchKey,
            insightsHashes,
            numberOfPeriods: COMPARE_AVERAGE_PERIOD_COUNT,
        }),
        hash: queryJSON.hash,
        snapshotHashes: graphEntries.flatMap(([, hashes]) => Object.values(hashes).filter((hash): hash is number => hash !== undefined)),
        headlineChart,
        supportingCharts,
    };
}

export {applyInsightsFilters, buildDateFormValues, buildInsightsQueryString};
export type {InsightsChartQuery, InsightsQuery};
export default buildInsightsJsonQuery;
