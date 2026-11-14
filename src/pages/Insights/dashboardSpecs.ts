/** Declares the charts each Insights dashboard renders and how they map to backend graph slots and search views. */

import type {ChartView, SearchChartCountDimension, SearchChartMetric, SearchGroupBy} from '@components/Search/types';

import {canEditWorkspaceSettings} from '@libs/PolicyUtils/permissions';
import {isArchivedOrPendingDeletePolicy, isControlPolicy, isGroupPolicy} from '@libs/PolicyUtils/policyType';
import {areApprovalsEnabled} from '@libs/PolicyUtils/workflows';
import {isPolicyEligibleForTopCategories, isPolicyEligibleForTopSpenders} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {HasFilterValues} from '@src/types/form/SearchAdvancedFiltersForm';
import type {Beta, InsightsDashboardID, InsightsGraphKey, InsightsSearchKey, Policy} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

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
    workflowStage?: ValueOf<typeof CONST.SEARCH.WORKFLOW_STAGES>;

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

    /** The search type of every query on the dashboard: `expense` for charts of expenses, `expense-report` for charts of reports */
    queryType: SearchDataTypes;

    /** What the charts' counts are counts of, which names them in the tooltip. Defaults to expenses. */
    countDimension?: SearchChartCountDimension;

    /** Whether the charts link to the Spend page, from their menus and from a pressed point that has no Details panel to open. Defaults to true. */
    supportsDrillIn?: boolean;

    /** The dashboard's charts are replaced by the Control upsell when no workspace in scope is on Control */
    requiresControlPlan?: boolean;

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
                graphKey: CONST.INSIGHTS.GRAPH.AVERAGE_PROCESSING_TIME,
                titleKey: 'insightsPage.averageProcessingTime',
                view: CONST.SEARCH.VIEW.PIE,
                groupBy: CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE,
                metric: CONST.SEARCH.CHART_METRIC.COUNT,
                sortBy: CONST.SEARCH.SORT_BY_COLUMNS.AVERAGE_TIME,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            },
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
        requiresControlPlan: true,
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

/** Returns the workspaces the filter leaves in scope. No selected workspaces means every workspace is in scope. */
function getPoliciesInScope(policies: OnyxCollection<Policy>, policyIDs: string[]): Policy[] {
    return Object.values(policies ?? {}).filter((policy): policy is Policy => !!policy && (policyIDs.length === 0 || policyIDs.includes(policy.id)));
}

/**
 * Returns the charts that at least one workspace in scope is eligible for.
 * A dashboard's own eligibility narrows the scope too, so a chart only counts the workspaces the dashboard reports on.
 */
function getVisibleCharts(
    charts: InsightsChartSpec[],
    policiesInScope: Policy[],
    login: string | undefined,
    isDashboardPolicyEligible?: InsightsDashboardSpec['isPolicyEligible'],
): InsightsChartSpec[] {
    const dashboardPolicies = isDashboardPolicyEligible ? policiesInScope.filter((policy) => isDashboardPolicyEligible(policy, login)) : policiesInScope;
    return charts.filter(({isPolicyEligible}) => !isPolicyEligible || dashboardPolicies.some((policy) => isPolicyEligible(policy, login)));
}

/**
 * Whether the dashboard needs Control but no workspace in scope can feed it, so the upsell stands in for the charts.
 * A Control workspace only counts when it would produce charts, so archived ones and ones the user can see no data for are ignored.
 * A stored filter can still hold workspaces that left Onyx. When none of its workspaces are left, it says nothing about the user's plans, so the dashboard keeps its usual states.
 */
function shouldUpsellControlPlan(dashboardID: InsightsDashboardID, policiesInScope: Policy[], policyIDs: string[], login: string | undefined): boolean {
    const {requiresControlPlan, isPolicyEligible} = INSIGHTS_DASHBOARD_SPECS[dashboardID];
    if (!requiresControlPlan || (policyIDs.length > 0 && policiesInScope.length === 0)) {
        return false;
    }
    return !policiesInScope.some((policy) => isControlPolicy(policy) && !isArchivedOrPendingDeletePolicy(policy) && (!isPolicyEligible || isPolicyEligible(policy, login)));
}

/**
 * Returns the workspaces in scope the user could upgrade to Control.
 * Eligibility mirrors the upgrade page's own gate so the CTA never lands on a not-found page.
 */
function getUpgradeablePolicyIDsInScope(policiesInScope: Policy[], login: string | undefined): string[] {
    return policiesInScope
        .filter((policy) => isGroupPolicy(policy) && !isControlPolicy(policy) && !isArchivedOrPendingDeletePolicy(policy) && canEditWorkspaceSettings(policy, login))
        .map((policy) => policy.id);
}

/**
 * Returns the dashboards the user can open, ignoring the workspace filter.
 * Workspaces deleted offline stay in Onyx until the server confirms, so they don't count, or a dashboard would vanish only on reconnect.
 */
function getAccessibleDashboards(policies: OnyxCollection<Policy>, login: string | undefined, isBetaEnabled: (beta: Beta) => boolean): InsightsDashboardID[] {
    const activePolicies = Object.values(policies ?? {}).filter((policy): policy is Policy => !!policy && !isArchivedOrPendingDeletePolicy(policy));
    return Object.values(CONST.INSIGHTS.DASHBOARD).filter((dashboardID) => {
        const {beta, isPolicyEligible} = INSIGHTS_DASHBOARD_SPECS[dashboardID];
        return (!beta || isBetaEnabled(beta)) && (!isPolicyEligible || activePolicies.some((policy) => isPolicyEligible(policy, login)));
    });
}

export {getAccessibleDashboards, getPoliciesInScope, getUpgradeablePolicyIDsInScope, getVisibleCharts, shouldUpsellControlPlan, VIOLATION_HAS_VALUES};
export type {InsightsChartSpec, InsightsDateFilterKey};
export default INSIGHTS_DASHBOARD_SPECS;
