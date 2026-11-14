import type {SearchCompareMode, SearchGroupBy, SearchQueryJSON, SearchQueryString} from '@components/Search/types';

import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON, buildSearchQueryString, getRangeQueryValue} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {InsightsDashboard, InsightsDashboardID, InsightsGraphKey} from '@src/types/onyx';

import type {InsightsChartSpec, InsightsDateFilterKey, InsightsViolationStages} from './dashboardSpecs';
import type {InsightsFilters} from './insightsFilters';

import INSIGHTS_DASHBOARD_SPECS, {applyViolationStage, getViolationStage, VIOLATION_HAS_VALUES} from './dashboardSpecs';
import {getQueryGroupBy} from './insightsGroupByUtils';

/** How many periods before the selected date range the Average mode spans */
const COMPARE_AVERAGE_PERIOD_COUNT = 1;

/** How many expenses the Details panel lists under Top expenses */
const TOP_EXPENSES_LIMIT = 10;

/** The form fields each date a chart can be narrowed by is written to */
const DATE_FORM_KEYS = {
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE]: {on: FILTER_KEYS.DATE_ON, range: FILTER_KEYS.DATE_RANGE},
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED]: {on: FILTER_KEYS.SUBMITTED_ON, range: FILTER_KEYS.SUBMITTED_RANGE},
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.ANY_APPROVAL]: {on: FILTER_KEYS.ANY_APPROVAL_ON, range: FILTER_KEYS.ANY_APPROVAL_RANGE},
} as const;

/** Builds the date filter in the shape a search query is built from, on the expense date unless another date is given. */
function buildDateFormValues(date: InsightsFilters['date'], dateFilterKey: InsightsDateFilterKey = CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE): Partial<SearchAdvancedFiltersForm> {
    const {on, range} = DATE_FORM_KEYS[dateFilterKey];
    if ('preset' in date) {
        return {[on]: date.preset};
    }
    if ('on' in date) {
        return {[on]: date.on};
    }
    return {[range]: getRangeQueryValue(date.from, date.to)};
}

/** Builds the page's filters in the shape a search query is built from. Leaves the workspaces out when none are selected, which reports on all of them. */
function buildFilterFormValues(filters: InsightsFilters, shouldIncludeDate = true, dateFilterKey?: InsightsDateFilterKey): Partial<SearchAdvancedFiltersForm> {
    return {
        ...(shouldIncludeDate && buildDateFormValues(filters.date, dateFilterKey)),
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
    const commonFilters = buildSearchQueryJSON(buildQueryStringFromFilterFormValues({...buildFilterFormValues(filters, false), has: VIOLATION_HAS_VALUES}))?.filters;

    return commonFilters ? {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: commonFilters, right: actionDates} : actionDates;
}

/** Builds the query with the dashboard's data type */
function buildDashboardQuery(query: SearchQueryString, dashboard: InsightsDashboardID): Readonly<SearchQueryJSON> | undefined {
    // Added to the built string, since building it from form values with this type would drop filters that type's Search doesn't support, like the group-by
    return buildSearchQueryJSON(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE}:${INSIGHTS_DASHBOARD_SPECS[dashboard].queryType} ${query}`);
}

/** Builds the dashboard-wide query the whole page is narrowed by. Keeps the grouping the user picked, Running total included, so reopening the dashboard restores it. `getQueryGroupBy` resolves it to a real bucket for the backend request. */
function buildInsightsQueryString(filters: InsightsFilters): SearchQueryString {
    // Running total is a display grouping outside the Search grammar, so it isn't a SearchGroupBy. The serializer writes it verbatim and the Insights parser reads it back.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the serializer accepts any groupBy string, and `parseInsightsFilters` reads `runningTotal` back off the raw query
    return buildQueryStringFromFilterFormValues({...buildFilterFormValues(filters), groupBy: filters.groupBy as SearchGroupBy, compare: filters.compare});
}

/** Builds a chart's query with the page's filters applied. */
function applyInsightsFilters(chart: InsightsChartSpec, filters: InsightsFilters, compare?: SearchCompareMode): SearchQueryString {
    const query = buildQueryStringFromFilterFormValues(
        {...buildFilterFormValues(filters, true, chart.dateFilterKey), has: chart.has, groupBy: chart.groupBy ?? getQueryGroupBy(filters), view: chart.view, compare},
        {sortBy: chart.sortBy, sortOrder: chart.sortOrder, limit: chart.limit},
    );
    // Appended, since the workflow stage isn't a filter the Search filter form has
    return chart.workflowStage ? `${query} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.WORKFLOW_STAGE}:${chart.workflowStage}` : query;
}

type InsightsChartQuery = {
    chart: InsightsChartSpec;
    queryJSON: Readonly<SearchQueryJSON> | undefined;
    previousPeriodQueryJSON?: Readonly<SearchQueryJSON>;
};

type InsightsGraphHashes = {
    snapshotHash: number;
    previousPeriodSnapshotHash?: number;
    averageSnapshotHash?: number;
};
type InsightsGraphHashEntry = [InsightsGraphKey, InsightsGraphHashes];

/** Returns the chart's graph slot paired with the hashes its current period, previous period and average are stored under. */
function buildSnapshotHashEntry(
    {chart, queryJSON, previousPeriodQueryJSON}: InsightsChartQuery,
    dashboard: InsightsDashboardID,
    filters: InsightsFilters,
): InsightsGraphHashEntry | undefined {
    const snapshotHash = queryJSON?.hash;
    if (!snapshotHash) {
        return undefined;
    }
    const previousPeriodSnapshotHash = previousPeriodQueryJSON?.hash;
    const averageSnapshotHash = buildDashboardQuery(applyInsightsFilters(chart, filters, CONST.SEARCH.COMPARE.AVERAGE), dashboard)?.hash;
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

/** Builds one request for the headline and supporting charts, applying each chart's picked violation stage and returns the chart queries to read their snapshots back with. */
function buildInsightsJsonQuery(
    dashboard: InsightsDashboardID,
    filters: InsightsFilters,
    supportingChartSpecs: InsightsChartSpec[],
    violationStages: InsightsViolationStages = {},
): InsightsQuery | undefined {
    // The backend saves inputQuery as the dashboard's filters, so it keeps the Group by the user picked, not the one fitted to the date range
    const inputQuery = buildInsightsQueryString(filters);
    const queryJSON = buildDashboardQuery(buildInsightsQueryString({...filters, groupBy: getQueryGroupBy(filters), compare: undefined}), dashboard);
    if (!queryJSON) {
        return undefined;
    }

    const spec = INSIGHTS_DASHBOARD_SPECS[dashboard];
    const buildChartQuery = (declaredChart: InsightsChartSpec): InsightsChartQuery => {
        const chart = applyViolationStage(declaredChart, violationStages[declaredChart.graphKey]);
        return {
            chart,
            queryJSON: buildDashboardQuery(applyInsightsFilters(chart, filters), dashboard),
            previousPeriodQueryJSON: buildDashboardQuery(applyInsightsFilters(chart, filters, CONST.SEARCH.COMPARE.PREVIOUS_PERIOD), dashboard),
        };
    };
    const headlineChart = buildChartQuery(spec.headlineChart);
    const supportingCharts = supportingChartSpecs.map(buildChartQuery);
    // GetInsights counts violations from both stages unless told otherwise, so every chart with a stage control names its stage, the submitters' by default
    const requestedViolationStages: InsightsViolationStages = Object.fromEntries(
        [spec.headlineChart, ...supportingChartSpecs].flatMap((chart) => {
            const stage = getViolationStage(chart, violationStages);
            return stage ? [[chart.graphKey, stage]] : [];
        }),
    );
    const hasViolationStages = Object.keys(requestedViolationStages).length > 0;
    const graphEntries = [headlineChart, ...supportingCharts]
        .map((chartQuery) => buildSnapshotHashEntry(chartQuery, dashboard, filters))
        .filter((entry): entry is InsightsGraphHashEntry => !!entry);
    const insightsHashes: InsightsDashboard['graphs'] = Object.fromEntries(graphEntries);

    return {
        jsonQuery: JSON.stringify({
            hash: queryJSON.hash,
            type: queryJSON.type,
            groupBy: queryJSON.groupBy,
            filters: dashboard === CONST.INSIGHTS.DASHBOARD.COMPLIANCE ? buildComplianceFilters(filters) : queryJSON.filters,
            inputQuery,
            searchKey: spec.searchKey,
            insightsHashes,
            numberOfPeriods: COMPARE_AVERAGE_PERIOD_COUNT,
            ...(hasViolationStages && {violationStages: requestedViolationStages}),
        }),
        hash: queryJSON.hash,
        snapshotHashes: graphEntries.flatMap(([, hashes]) => Object.values(hashes).filter((hash): hash is number => hash !== undefined)),
        headlineChart,
        supportingCharts,
    };
}

/** Builds a Spend table query for its largest expenses, sorted by amount. */
function buildTopExpensesQueryJSON(query: SearchQueryString): Readonly<SearchQueryJSON> | undefined {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON) {
        return undefined;
    }

    return buildSearchQueryJSON(buildSearchQueryString({...queryJSON, sortBy: CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, sortOrder: CONST.SEARCH.SORT_ORDER.DESC, limit: TOP_EXPENSES_LIMIT}));
}

export {applyInsightsFilters, buildDateFormValues, buildInsightsQueryString, buildTopExpensesQueryJSON, TOP_EXPENSES_LIMIT};
export type {InsightsChartQuery, InsightsQuery};
export default buildInsightsJsonQuery;
