/** Declares the charts each Insights dashboard renders and how they map to backend graph slots and search views. */

import type {ChartView, SearchChartMetric, SearchGroupBy} from '@components/Search/types';

import {areApprovalsEnabled} from '@libs/PolicyUtils';
import {isPolicyEligibleForTopCategories, isPolicyEligibleForTopSpenders} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {HasFilterValues} from '@src/types/form/SearchAdvancedFiltersForm';
import type {Beta, InsightsDashboardID, InsightsGraphKey, InsightsSearchKey, Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {canViewAllPolicyData, hasMultipleMembers} from './insightsAccess';

/** Dates a chart can narrow the page's period by */
type InsightsDateFilterKey = typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.ANY_APPROVAL;

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

    /** Narrows the chart's query to expenses that have these */
    has?: HasFilterValues;

    /** The date the page's date filter applies to, so the chart's Spend query matches what the backend counts. Defaults to the expense date. */
    dateFilterKey?: InsightsDateFilterKey;

    /** The chart is shown when any workspace in scope passes this. A chart that declares none is always shown. */
    isPolicyEligible?: (policy: Policy, login: string | undefined) => boolean;
};

/** Violations kept at submission or approval */
const VIOLATION_HAS_VALUES: HasFilterValues = [CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION, CONST.SEARCH.HAS_VALUES.APPROVED_VIOLATION];

type InsightsDashboardSpec = {
    /** Identifies the dashboard to the backend. */
    searchKey: InsightsSearchKey;

    /** Label of the dashboard's tab in the segmented control */
    labelKey: TranslationPaths;

    /** The dashboard is hidden unless this beta is enabled */
    beta?: Beta;

    /** The dashboard is shown when any workspace in scope passes this. A dashboard that declares none is always shown. */
    isPolicyEligible?: (policy: Policy, login: string | undefined) => boolean;

    /** Chart across the top of the page, the only one the group-by filter applies to */
    headlineChart: InsightsChartSpec;

    /** Charts in the grid below, grouped the way each of them declares */
    supportingCharts: InsightsChartSpec[];
};

const INSIGHTS_DASHBOARD_SPECS: Record<InsightsDashboardID, InsightsDashboardSpec> = {
    [CONST.INSIGHTS.DASHBOARD.SPEND]: {
        searchKey: CONST.INSIGHTS.SEARCH_KEY.SPEND,
        labelKey: 'common.spend',
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
    [CONST.INSIGHTS.DASHBOARD.COMPLIANCE]: {
        searchKey: CONST.INSIGHTS.SEARCH_KEY.COMPLIANCE,
        labelKey: 'insightsPage.compliance',
        beta: CONST.BETAS.INSIGHTS_COMPLIANCE,
        isPolicyEligible: canViewAllPolicyData,
        headlineChart: {
            graphKey: CONST.INSIGHTS.GRAPH.VIOLATIONS_OVER_TIME,
            titleKey: 'insightsPage.violationsOverTime',
            view: CONST.SEARCH.VIEW.LINE,
            has: VIOLATION_HAS_VALUES,
            metric: CONST.SEARCH.CHART_METRIC.COUNT,
        },
        supportingCharts: [
            {
                graphKey: CONST.INSIGHTS.GRAPH.TOP_VIOLATIONS,
                titleKey: 'insightsPage.topViolations',
                has: VIOLATION_HAS_VALUES,
                view: CONST.SEARCH.VIEW.PIE,
                groupBy: CONST.SEARCH.GROUP_BY.VIOLATION,
                metric: CONST.SEARCH.CHART_METRIC.COUNT,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
            },
            {
                graphKey: CONST.INSIGHTS.GRAPH.VIOLATIONS_BY_SUBMITTER,
                titleKey: 'insightsPage.violationsBySubmitter',
                has: [CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION],
                dateFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED,
                view: CONST.SEARCH.VIEW.BAR,
                groupBy: CONST.SEARCH.GROUP_BY.FROM,
                metric: CONST.SEARCH.CHART_METRIC.COUNT,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
                isPolicyEligible: hasMultipleMembers,
            },
            {
                graphKey: CONST.INSIGHTS.GRAPH.VIOLATIONS_BY_APPROVER,
                titleKey: 'insightsPage.violationsByApprover',
                has: [CONST.SEARCH.HAS_VALUES.APPROVED_VIOLATION],
                dateFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.ANY_APPROVAL,
                view: CONST.SEARCH.VIEW.BAR,
                groupBy: CONST.SEARCH.GROUP_BY.APPROVER,
                metric: CONST.SEARCH.CHART_METRIC.COUNT,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
                isPolicyEligible: (policy) => hasMultipleMembers(policy) && areApprovalsEnabled(policy),
            },
        ],
    },
};

/**
 * Returns the charts that at least one workspace in scope is eligible for. No selected workspaces means every workspace is in scope.
 * A dashboard's own eligibility narrows the scope too, so a chart only counts the workspaces the dashboard reports on.
 */
function getVisibleCharts(
    charts: InsightsChartSpec[],
    policies: OnyxCollection<Policy>,
    policyIDs: string[],
    login: string | undefined,
    isDashboardPolicyEligible?: InsightsDashboardSpec['isPolicyEligible'],
): InsightsChartSpec[] {
    const policiesInScope = Object.values(policies ?? {}).filter(
        (policy): policy is Policy => !!policy && (policyIDs.length === 0 || policyIDs.includes(policy.id)) && (!isDashboardPolicyEligible || isDashboardPolicyEligible(policy, login)),
    );
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

export {getAccessibleDashboards, getVisibleCharts, VIOLATION_HAS_VALUES};
export type {InsightsChartSpec, InsightsDateFilterKey};
export default INSIGHTS_DASHBOARD_SPECS;
