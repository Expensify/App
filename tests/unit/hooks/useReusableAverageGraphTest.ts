import {renderHook} from '@testing-library/react-native';

import type {InsightsChartSpec, InsightsViolationStages} from '@pages/Insights/dashboardSpecs';
import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {INSIGHTS_RUNNING_TOTAL_GROUP_BY} from '@pages/Insights/insightsFilters';
import useReusableAverageGraph from '@pages/Insights/useReusableAverageGraph';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboard, InsightsDashboardID} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

type HookProps = {
    dashboardID: InsightsDashboardID;
    hash: number | undefined;
    isCurrentDashboardLoaded: boolean;
    filters: InsightsFilters;
    violationStages: InsightsViolationStages;
};

type InsightsGraph = NonNullable<NonNullable<InsightsDashboard['graphs']>[InsightsChartSpec['graphKey']]>;

const LOADED_HASH = 111;
const LOADING_HASH = 222;

const SPEND_SPECS = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND];
const COMPLIANCE_SPECS = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.COMPLIANCE];

const FILTERS: InsightsFilters = {
    date: {from: '2026-01-01', to: '2026-12-31'},
    policyIDs: ['policy1'],
    groupBy: CONST.SEARCH.GROUP_BY.MONTH,
    groupCurrency: 'USD',
    compare: CONST.SEARCH.COMPARE.AVERAGE,
    tagLevel: 1,
};

const GRAPH: InsightsGraph = {snapshotHash: 1, averageSnapshotHash: 2, averageAmount: 500, averageCount: 5};

function getChart(charts: InsightsChartSpec[], graphKey: InsightsChartSpec['graphKey']): InsightsChartSpec {
    const chart = charts.find((item) => item.graphKey === graphKey);
    if (!chart) {
        throw new Error(`Missing ${graphKey} spec`);
    }
    return chart;
}

const SPEND_HEADLINE = SPEND_SPECS.headlineChart;
const TOP_SPENDERS = getChart(SPEND_SPECS.supportingCharts, CONST.INSIGHTS.GRAPH.TOP_SPENDERS);
const TOP_CATEGORIES = getChart(SPEND_SPECS.supportingCharts, CONST.INSIGHTS.GRAPH.TOP_CATEGORIES);
const TOP_TAGS = getChart(SPEND_SPECS.supportingCharts, CONST.INSIGHTS.GRAPH.TOP_TAGS);
const COMPLIANCE_HEADLINE = COMPLIANCE_SPECS.headlineChart;
const VIOLATIONS_BY_SUBMITTER = getChart(COMPLIANCE_SPECS.supportingCharts, CONST.INSIGHTS.GRAPH.VIOLATIONS_BY_SUBMITTER);

async function storeDashboard(dashboardID: InsightsDashboardID, hash: number, graphKeys: Array<InsightsChartSpec['graphKey']>) {
    const graphs = Object.fromEntries(graphKeys.map((graphKey) => [graphKey, GRAPH]));
    await Onyx.set(`${ONYXKEYS.COLLECTION.INSIGHTS}${dashboardID}_${hash}`, {graphs});
}

/** Renders the hook with a loaded entry, then switches it to a new entry that hasn't loaded yet */
async function renderWithLoadedEntry(loadedProps: HookProps, loadingProps: Partial<HookProps>) {
    const {result, rerender} = renderHook((props: HookProps) => useReusableAverageGraph(props), {initialProps: loadedProps});
    await waitForBatchedUpdatesWithAct();
    rerender({...loadedProps, hash: LOADING_HASH, isCurrentDashboardLoaded: false, ...loadingProps});
    await waitForBatchedUpdatesWithAct();
    return {result, rerender};
}

const SPEND_LOADED_PROPS: HookProps = {
    dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND,
    hash: LOADED_HASH,
    isCurrentDashboardLoaded: true,
    filters: FILTERS,
    violationStages: {},
};

describe('useReusableAverageGraph', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('returns no graph before any dashboard entry has loaded', async () => {
        // Given a dashboard whose first entry is still loading
        const {result} = renderHook(() => useReusableAverageGraph({...SPEND_LOADED_PROPS, isCurrentDashboardLoaded: false}));
        await waitForBatchedUpdatesWithAct();

        // When a chart asks for its average graph
        const graph = result.current.getReusableAverageGraph(TOP_SPENDERS);

        // Then there is nothing to reuse, so the chart waits for the response
        expect(graph).toBeUndefined();
    });

    it('reuses the averages of charts with their own grouping when only the date grouping changes', async () => {
        // Given a loaded Spend entry
        await storeDashboard(CONST.INSIGHTS.DASHBOARD.SPEND, LOADED_HASH, [CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME, CONST.INSIGHTS.GRAPH.TOP_SPENDERS]);

        // When the user picks another date grouping and the new entry is loading
        const {result} = await renderWithLoadedEntry(SPEND_LOADED_PROPS, {filters: {...FILTERS, groupBy: CONST.SEARCH.GROUP_BY.QUARTER}});

        // Then Top spenders keeps its average, because its grouping doesn't follow the date grouping, while the headline chart grouped by date waits for the new one
        expect(result.current.getReusableAverageGraph(TOP_SPENDERS)).toEqual(GRAPH);
        expect(result.current.getReusableAverageGraph(SPEND_HEADLINE)).toBeUndefined();
    });

    it('reuses the headline average when a new grouping queries the same date bucket', async () => {
        // Given a loaded Spend entry grouped by month over a whole year
        await storeDashboard(CONST.INSIGHTS.DASHBOARD.SPEND, LOADED_HASH, [CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME]);

        // When the user switches to Running total, which a year long range queries by month too
        const {result} = await renderWithLoadedEntry(SPEND_LOADED_PROPS, {filters: {...FILTERS, groupBy: INSIGHTS_RUNNING_TOTAL_GROUP_BY}});

        // Then the headline chart keeps its average, because the queried bucket didn't change
        expect(result.current.getReusableAverageGraph(SPEND_HEADLINE)).toEqual(GRAPH);
    });

    it('reuses the averages when only the compare mode changes', async () => {
        // Given a loaded Spend entry
        await storeDashboard(CONST.INSIGHTS.DASHBOARD.SPEND, LOADED_HASH, [CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME, CONST.INSIGHTS.GRAPH.TOP_SPENDERS]);

        // When the user switches the compare mode and the new entry is loading
        const {result} = await renderWithLoadedEntry(SPEND_LOADED_PROPS, {filters: {...FILTERS, compare: CONST.SEARCH.COMPARE.PREVIOUS_PERIOD}});

        // Then every chart keeps its average, because the compare mode doesn't change it
        expect(result.current.getReusableAverageGraph(SPEND_HEADLINE)).toEqual(GRAPH);
        expect(result.current.getReusableAverageGraph(TOP_SPENDERS)).toEqual(GRAPH);
    });

    it('does not reuse the averages when the date range changes', async () => {
        // Given a loaded Spend entry
        await storeDashboard(CONST.INSIGHTS.DASHBOARD.SPEND, LOADED_HASH, [CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME, CONST.INSIGHTS.GRAPH.TOP_SPENDERS]);

        // When the user picks another date range and the new entry is loading
        const {result} = await renderWithLoadedEntry(SPEND_LOADED_PROPS, {filters: {...FILTERS, date: {from: '2025-01-01', to: '2025-12-31'}}});

        // Then no chart reuses the old average, because it was computed for another period
        expect(result.current.getReusableAverageGraph(SPEND_HEADLINE)).toBeUndefined();
        expect(result.current.getReusableAverageGraph(TOP_SPENDERS)).toBeUndefined();
    });

    it('does not reuse the averages when the workspaces change', async () => {
        // Given a loaded Spend entry
        await storeDashboard(CONST.INSIGHTS.DASHBOARD.SPEND, LOADED_HASH, [CONST.INSIGHTS.GRAPH.TOP_SPENDERS]);

        // When the user picks other workspaces and the new entry is loading
        const {result} = await renderWithLoadedEntry(SPEND_LOADED_PROPS, {filters: {...FILTERS, policyIDs: ['policy2']}});

        // Then the old average isn't reused, because it covers other workspaces
        expect(result.current.getReusableAverageGraph(TOP_SPENDERS)).toBeUndefined();
    });

    it('reuses the averages on a tag level change except for the chart grouped by tag', async () => {
        // Given a loaded Spend entry on the first tag level
        await storeDashboard(CONST.INSIGHTS.DASHBOARD.SPEND, LOADED_HASH, [CONST.INSIGHTS.GRAPH.TOP_CATEGORIES, CONST.INSIGHTS.GRAPH.TOP_TAGS]);

        // When the user picks the second tag level and the new entry is loading
        const {result} = await renderWithLoadedEntry(SPEND_LOADED_PROPS, {filters: {...FILTERS, tagLevel: 2}});

        // Then Top categories keeps its average, while Top tags waits for the average of the new level
        expect(result.current.getReusableAverageGraph(TOP_CATEGORIES)).toEqual(GRAPH);
        expect(result.current.getReusableAverageGraph(TOP_TAGS)).toBeUndefined();
    });

    it('reuses the averages on a violation stage change except for the charts that show that stage', async () => {
        // Given a loaded Compliance entry on the submitted stage
        await storeDashboard(CONST.INSIGHTS.DASHBOARD.COMPLIANCE, LOADED_HASH, [CONST.INSIGHTS.GRAPH.VIOLATIONS_OVER_TIME, CONST.INSIGHTS.GRAPH.VIOLATIONS_BY_SUBMITTER]);
        const loadedProps: HookProps = {...SPEND_LOADED_PROPS, dashboardID: CONST.INSIGHTS.DASHBOARD.COMPLIANCE};

        // When the user switches the headline chart to the approved stage and the new entry is loading
        const {result} = await renderWithLoadedEntry(loadedProps, {
            violationStages: {[CONST.INSIGHTS.GRAPH.VIOLATIONS_OVER_TIME]: CONST.INSIGHTS.VIOLATION_STAGE.APPROVED},
        });

        // Then the headline chart waits for the average of the new stage, while Violations by submitter keeps its own
        expect(result.current.getReusableAverageGraph(COMPLIANCE_HEADLINE)).toBeUndefined();
        expect(result.current.getReusableAverageGraph(VIOLATIONS_BY_SUBMITTER)).toEqual(GRAPH);
    });

    it('does not reuse the averages of another dashboard', async () => {
        // Given a loaded Spend entry
        await storeDashboard(CONST.INSIGHTS.DASHBOARD.SPEND, LOADED_HASH, [CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME]);

        // When the user opens the Compliance dashboard with the same filters and it is loading
        const {result} = await renderWithLoadedEntry(SPEND_LOADED_PROPS, {dashboardID: CONST.INSIGHTS.DASHBOARD.COMPLIANCE});

        // Then Compliance charts don't read the Spend averages
        expect(result.current.getReusableAverageGraph(COMPLIANCE_HEADLINE)).toBeUndefined();
    });

    it('reuses the averages of the most recently loaded entry', async () => {
        // Given two loaded Spend entries with different averages, the second loaded after a compare mode change
        await storeDashboard(CONST.INSIGHTS.DASHBOARD.SPEND, LOADED_HASH, [CONST.INSIGHTS.GRAPH.TOP_SPENDERS]);
        const secondGraph: InsightsGraph = {...GRAPH, averageAmount: 900};
        await Onyx.set(`${ONYXKEYS.COLLECTION.INSIGHTS}${CONST.INSIGHTS.DASHBOARD.SPEND}_${LOADING_HASH}`, {graphs: {[CONST.INSIGHTS.GRAPH.TOP_SPENDERS]: secondGraph}});
        const secondFilters = {...FILTERS, compare: CONST.SEARCH.COMPARE.PREVIOUS_PERIOD};
        const {result, rerender} = renderHook((props: HookProps) => useReusableAverageGraph(props), {initialProps: SPEND_LOADED_PROPS});
        await waitForBatchedUpdatesWithAct();
        rerender({...SPEND_LOADED_PROPS, hash: LOADING_HASH, filters: secondFilters});
        await waitForBatchedUpdatesWithAct();

        // When the user picks another date grouping and a third entry is loading
        rerender({...SPEND_LOADED_PROPS, hash: 333, isCurrentDashboardLoaded: false, filters: {...secondFilters, groupBy: CONST.SEARCH.GROUP_BY.QUARTER}});
        await waitForBatchedUpdatesWithAct();

        // Then Top spenders shows the average of the second entry, not the first one
        expect(result.current.getReusableAverageGraph(TOP_SPENDERS)).toEqual(secondGraph);
    });
});
