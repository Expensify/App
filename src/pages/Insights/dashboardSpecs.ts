/** Declares the charts each Insights dashboard renders and how they map to backend graph slots and search views. */

import type {ChartView, SearchChartCountDimension, SearchChartMetric, SearchGroupBy} from '@components/Search/types';

import {areApprovalsEnabled} from '@libs/PolicyUtils';
import {isPolicyEligibleForTopCategories, isPolicyEligibleForTopSpenders} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Beta, InsightsDashboardID, InsightsGraphKey, InsightsSearchKey, Policy} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {canViewAllPolicyData} from './insightsAccess';

type InsightsChartSpec = {
    /** Slot the request names the chart's snapshot under, and the response's `graphs` confirms it in */
    graphKey: InsightsGraphKey;
    titleKey: TranslationPaths;
    view: ChartView;

    /** What the chart plots for each group, left out by charts plotting the money each group totals */
    metric?: SearchChartMetric;

    /** What the chart aggregates by, left out by charts that follow the page's group-by filter */
    groupBy?: SearchGroupBy;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    workflowStage?: ValueOf<typeof CONST.SEARCH.WORKFLOW_STAGES>;

    /** The chart is shown when any workspace in scope passes this. A chart that declares none is always shown. */
    isPolicyEligible?: (policy: Policy, login: string | undefined) => boolean;
};

type InsightsDashboardSpec = {
    /** Identifies the dashboard to the backend. */
    searchKey: InsightsSearchKey;

    /** Label of the dashboard's tab in the segmented control */
    labelKey: TranslationPaths;

    /** The dashboard is hidden unless this beta is enabled */
    beta?: Beta;

    /** The dashboard is shown when any workspace in scope passes this. A dashboard that declares none is always shown. */
    isPolicyEligible?: (policy: Policy, login: string | undefined) => boolean;

    /** What the dashboard's queries search for, which also sets the type its snapshots are stored with */
    queryType: SearchDataTypes;

    /** What the charts' counts are counts of, which names them in the tooltip. Defaults to expenses. */
    countDimension?: SearchChartCountDimension;

    /** Whether the charts link to the Spend page, from their menus and from a pressed point that has no Details panel to open. Defaults to true. */
    supportsDrillIn?: boolean;

    /** Chart across the top of the page, the only one the group-by filter applies to */
    headlineChart: InsightsChartSpec;

    /** Charts in the grid below, grouped the way each of them declares */
    supportingCharts: InsightsChartSpec[];
};

const INSIGHTS_DASHBOARD_SPECS: Record<InsightsDashboardID, InsightsDashboardSpec> = {
    [CONST.INSIGHTS.DASHBOARD.SPEND]: {
        searchKey: CONST.INSIGHTS.SEARCH_KEY.SPEND,
        labelKey: 'common.spend',
        queryType: CONST.SEARCH.DATA_TYPES.EXPENSE,
        headlineChart: {
            graphKey: CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME,
            titleKey: 'search.spendOverTime',
            view: CONST.SEARCH.VIEW.LINE,
        },
        supportingCharts: [
            {
                graphKey: CONST.INSIGHTS.GRAPH.TOP_SPENDERS,
                titleKey: 'search.tabs.topSpenders',
                view: CONST.SEARCH.VIEW.BAR,
                groupBy: CONST.SEARCH.GROUP_BY.FROM,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
                isPolicyEligible: isPolicyEligibleForTopSpenders,
            },
            {
                graphKey: CONST.INSIGHTS.GRAPH.TOP_MERCHANTS,
                titleKey: 'search.tabs.topMerchants',
                view: CONST.SEARCH.VIEW.BAR,
                groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
            },
            {
                graphKey: CONST.INSIGHTS.GRAPH.TOP_CATEGORIES,
                titleKey: 'search.tabs.topCategories',
                view: CONST.SEARCH.VIEW.PIE,
                groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
                isPolicyEligible: isPolicyEligibleForTopCategories,
            },
        ],
    },
    [CONST.INSIGHTS.DASHBOARD.EFFICIENCY]: {
        searchKey: CONST.INSIGHTS.SEARCH_KEY.EFFICIENCY,
        labelKey: 'insightsPage.efficiency',
        beta: CONST.BETAS.INSIGHTS_EFFICIENCY,
        isPolicyEligible: canViewAllPolicyData,
        queryType: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        countDimension: CONST.SEARCH.CHART_COUNT_DIMENSION.REPORT,
        supportsDrillIn: false,
        headlineChart: {
            graphKey: CONST.INSIGHTS.GRAPH.WORKFLOW_EFFICIENCY,
            titleKey: 'insightsPage.workflowEfficiency',
            view: CONST.SEARCH.VIEW.BAR,
            metric: CONST.SEARCH.CHART_METRIC.COUNT,
        },
        supportingCharts: [
            {
                graphKey: CONST.INSIGHTS.GRAPH.LONGEST_TO_SUBMIT,
                titleKey: 'insightsPage.longestToSubmit',
                workflowStage: CONST.SEARCH.WORKFLOW_STAGES.CREATED_SUBMITTED,
                view: CONST.SEARCH.VIEW.BAR,
                groupBy: CONST.SEARCH.GROUP_BY.FROM,
                metric: CONST.SEARCH.CHART_METRIC.COUNT,
                sortBy: CONST.SEARCH.SORT_BY_COLUMNS.AVERAGE_TIME,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
            },
            {
                graphKey: CONST.INSIGHTS.GRAPH.SLOWEST_TO_APPROVE,
                titleKey: 'insightsPage.slowestToApprove',
                workflowStage: CONST.SEARCH.WORKFLOW_STAGES.SUBMITTED_APPROVED,
                view: CONST.SEARCH.VIEW.BAR,
                groupBy: CONST.SEARCH.GROUP_BY.APPROVER,
                metric: CONST.SEARCH.CHART_METRIC.COUNT,
                isPolicyEligible: areApprovalsEnabled,
                sortBy: CONST.SEARCH.SORT_BY_COLUMNS.AVERAGE_TIME,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
            },
            {
                graphKey: CONST.INSIGHTS.GRAPH.MOST_TIME_TO_PAY,
                titleKey: 'insightsPage.mostTimeToPay',
                workflowStage: CONST.SEARCH.WORKFLOW_STAGES.APPROVED_PAID,
                view: CONST.SEARCH.VIEW.BAR,
                groupBy: CONST.SEARCH.GROUP_BY.PAID_BY,
                metric: CONST.SEARCH.CHART_METRIC.COUNT,
                sortBy: CONST.SEARCH.SORT_BY_COLUMNS.AVERAGE_TIME,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
            },
        ],
    },
    [CONST.INSIGHTS.DASHBOARD.COMPLIANCE]: {
        searchKey: CONST.INSIGHTS.SEARCH_KEY.COMPLIANCE,
        labelKey: 'insightsPage.compliance',
        beta: CONST.BETAS.INSIGHTS_COMPLIANCE,
        isPolicyEligible: canViewAllPolicyData,
        queryType: CONST.SEARCH.DATA_TYPES.EXPENSE,
        headlineChart: {
            graphKey: CONST.INSIGHTS.GRAPH.VIOLATIONS_OVER_TIME,
            titleKey: 'insightsPage.compliance',
            view: CONST.SEARCH.VIEW.LINE,
            metric: CONST.SEARCH.CHART_METRIC.COUNT,
        },
        supportingCharts: [],
    },
};

/** Returns the charts that at least one workspace in scope is eligible for. No selected workspaces means every workspace is in scope. */
function getVisibleCharts(charts: InsightsChartSpec[], policies: OnyxCollection<Policy>, policyIDs: string[], login: string | undefined): InsightsChartSpec[] {
    const policiesInScope = Object.values(policies ?? {}).filter((policy): policy is Policy => !!policy && (policyIDs.length === 0 || policyIDs.includes(policy.id)));
    return charts.filter(({isPolicyEligible}) => !isPolicyEligible || policiesInScope.some((policy) => isPolicyEligible(policy, login)));
}

/** Returns the dashboards the user can open, ignoring the workspace filter. */
function getAccessibleDashboards(policies: OnyxCollection<Policy>, login: string | undefined, isBetaEnabled: (beta: Beta) => boolean): InsightsDashboardID[] {
    const allPolicies = Object.values(policies ?? {});
    return Object.values(CONST.INSIGHTS.DASHBOARD).filter((dashboardID) => {
        const {beta, isPolicyEligible} = INSIGHTS_DASHBOARD_SPECS[dashboardID];
        return (!beta || isBetaEnabled(beta)) && (!isPolicyEligible || allPolicies.some((policy) => !!policy && isPolicyEligible(policy, login)));
    });
}

export {getAccessibleDashboards, getVisibleCharts};
export type {InsightsChartSpec};
export default INSIGHTS_DASHBOARD_SPECS;
