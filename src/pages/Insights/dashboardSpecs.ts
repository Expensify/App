/** Declares the charts each Insights dashboard renders and how they map to backend graph slots and search views. */

import type {GroupedItem, SearchChartCountDimension, SearchChartMetric, SearchGroupBy, SearchView} from '@components/Search/types';

import {arePaymentsEnabled} from '@libs/PolicyUtils/payments';
import {canEditWorkspaceSettings} from '@libs/PolicyUtils/permissions';
import {isArchivedOrPendingDeletePolicy, isControlPolicy, isGroupPolicy} from '@libs/PolicyUtils/policyType';
import {areApprovalsEnabled} from '@libs/PolicyUtils/workflows';
import {isPolicyEligibleForTopCategories, isPolicyEligibleForTopSpenders, isPolicyEligibleForTopTags} from '@libs/SearchUIUtils';

import colors from '@styles/theme/colors';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {HasFilterValues} from '@src/types/form/SearchAdvancedFiltersForm';
import type {InsightsDashboardID, InsightsGraphKey, InsightsSearchKey, Policy} from '@src/types/onyx';
import type {SearchDataTypes, SearchWorkflowStageDurations} from '@src/types/onyx/SearchResults';

import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {canViewAllPolicyData, hasMultipleMembers} from './insightsAccess';

type PolicyEligibilityCheck = (policy: Policy, login: string | undefined) => boolean;

/** One workflow stage a chart shows */
type InsightsChartStage = {
    workflowStage: ValueOf<typeof CONST.SEARCH.WORKFLOW_STAGES>;

    /** The time-bucket field holding how long the bucket's reports spent in the stage */
    durationField: keyof SearchWorkflowStageDurations;

    /** Color of the stage's segment in the current period's stack */
    color: string;

    /** Color of the stage's segment in the previous period's stack */
    comparisonColor: string;

    /** The stage is shown when any workspace in scope passes this. A stage that declares none is always shown. */
    isPolicyEligible?: PolicyEligibilityCheck;
};

/** The stages a report moves through, in order, each drawn in a darker shade of its period's hue than the one after it */
const WORKFLOW_STAGES: InsightsChartStage[] = [
    {
        workflowStage: CONST.SEARCH.WORKFLOW_STAGES.CREATED_SUBMITTED,
        durationField: 'submitAverageTime',
        color: colors.blue600,
        comparisonColor: colors.green600,
    },
    {
        workflowStage: CONST.SEARCH.WORKFLOW_STAGES.SUBMITTED_APPROVED,
        durationField: 'approveAverageTime',
        color: colors.blue400,
        comparisonColor: colors.green400,
        isPolicyEligible: areApprovalsEnabled,
    },
    {
        workflowStage: CONST.SEARCH.WORKFLOW_STAGES.APPROVED_PAID,
        durationField: 'reimburseAverageTime',
        color: colors.blue200,
        comparisonColor: colors.green200,
    },
];

/** Dates a chart can narrow the page's period by */
type InsightsDateFilterKey = typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.ANY_SUBMISSION | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.ANY_APPROVAL;

/** Whose violations a chart counts: the ones kept when expenses were submitted, or when they were approved */
type InsightsViolationStage = ValueOf<typeof CONST.INSIGHTS.VIOLATION_STAGE>;

/** Violation stage the user picked on each chart that offers one */
type InsightsViolationStages = Partial<Record<InsightsGraphKey, InsightsViolationStage>>;

type InsightsChartSpec = {
    /** Slot the request names the chart's snapshot under, and the response's `graphs` confirms it in */
    graphKey: InsightsGraphKey;
    titleKey: TranslationPaths;
    view: SearchView;

    /** Whether the chart spans the dashboard's whole width instead of sharing the two-column grid */
    isFullWidth?: boolean;

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

    /** Lets the user switch the chart between submitters' and approvers' violations. The chart's own `has` and `dateFilterKey` are the submitters' default. */
    hasViolationStageControl?: boolean;

    /** Stage whose violations a chart without a stage control counts, which Explain names */
    violationStage?: InsightsViolationStage;

    /** The chart is shown when any workspace in scope passes this. A chart that declares none is always shown. */
    isPolicyEligible?: PolicyEligibilityCheck;

    /**
     * The workflow stages the chart shows, of which it drops those no workspace in scope is eligible for.
     * A time-grouped chart stacks them in each bucket's column, and a chart grouped by workflow stage draws them as its groups.
     */
    stages?: InsightsChartStage[];
};

/** Violations kept at submission or approval */
const VIOLATION_HAS_VALUES: HasFilterValues = [CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION, CONST.SEARCH.HAS_VALUES.APPROVED_VIOLATION];

/** The violations each stage counts, and the action date the backend buckets them by, so the Spend query finds the same expenses even when a report was submitted more than once */
const VIOLATION_STAGE_FILTERS: Record<InsightsViolationStage, Required<Pick<InsightsChartSpec, 'has' | 'dateFilterKey'>>> = {
    [CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED]: {has: [CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION], dateFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.ANY_SUBMISSION},
    [CONST.INSIGHTS.VIOLATION_STAGE.APPROVED]: {has: [CONST.SEARCH.HAS_VALUES.APPROVED_VIOLATION], dateFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.ANY_APPROVAL},
};

type InsightsDashboardSpec = {
    /** Identifies the dashboard to the backend. */
    searchKey: InsightsSearchKey;

    /** Label of the dashboard's tab in the segmented control */
    labelKey: TranslationPaths;

    /** The dashboard is shown when any workspace in scope passes this. A dashboard that declares none is always shown. */
    isPolicyEligible?: PolicyEligibilityCheck;

    /** The search type of every query on the dashboard: `expense` for charts of expenses, `expense-report` for charts of reports */
    queryType: SearchDataTypes;

    /** What the charts' counts are counts of, which names them in the tooltip. Defaults to expenses. */
    countDimension?: SearchChartCountDimension;

    /** Whether the charts link to the Spend page, from their menus and from a pressed point that has no Details panel to open. Defaults to true. */
    supportsDrillIn?: boolean;

    /** Whether a pressed point opens the Details panel */
    hasDetailsPanel: boolean;

    /** The dashboard's charts are replaced by the Control upsell when no workspace in scope is on Control */
    requiresControlPlan?: boolean;

    /** Chart across the top of the page, the only one the group-by filter applies to */
    headlineChart: InsightsChartSpec;

    /** Charts in the grid below, grouped the way each of them declares */
    supportingCharts: InsightsChartSpec[];
};

/** The workspace IDs that decide whether a dashboard needing Control shows the upsell */
type InsightsControlPlanCoverage = {
    /** Every workspace in Onyx. A filter whose workspaces are all missing from it says nothing about the user's plans. */
    policyIDs: string[];

    /** Control workspaces the dashboard has charts for */
    eligibleControlPolicyIDs: string[];
};

/** What the dashboard renders from the workspaces its filter leaves in scope */
type InsightsScopeEligibility = {
    /** Supporting charts at least one workspace in scope is eligible for */
    visibleGraphKeys: InsightsGraphKey[];

    /** Stages at least one workspace in scope is eligible for, for each chart that declares stages */
    enabledStages: Partial<Record<InsightsGraphKey, Array<InsightsChartStage['workflowStage']>>>;

    /** Workspaces in scope the user could upgrade to Control */
    upgradeablePolicyIDs: string[];
};

const INSIGHTS_DASHBOARD_SPECS: Record<InsightsDashboardID, InsightsDashboardSpec> = {
    [CONST.INSIGHTS.DASHBOARD.SPEND]: {
        searchKey: CONST.INSIGHTS.SEARCH_KEY.SPEND,
        labelKey: 'common.spend',
        queryType: CONST.SEARCH.DATA_TYPES.EXPENSE,
        hasDetailsPanel: true,
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
            {
                graphKey: CONST.INSIGHTS.GRAPH.TOP_TAGS,
                titleKey: 'search.tabs.topTags',
                view: CONST.SEARCH.VIEW.PIE,
                groupBy: CONST.SEARCH.GROUP_BY.TAG,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
                isPolicyEligible: isPolicyEligibleForTopTags,
            },
        ],
    },
    [CONST.INSIGHTS.DASHBOARD.EFFICIENCY]: {
        searchKey: CONST.INSIGHTS.SEARCH_KEY.EFFICIENCY,
        labelKey: 'insightsPage.efficiency',
        isPolicyEligible: canViewAllPolicyData,
        queryType: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        countDimension: CONST.SEARCH.CHART_COUNT_DIMENSION.REPORT,
        supportsDrillIn: false,
        hasDetailsPanel: false,
        headlineChart: {
            graphKey: CONST.INSIGHTS.GRAPH.WORKFLOW_EFFICIENCY,
            titleKey: 'insightsPage.workflowEfficiency',
            view: CONST.SEARCH.VIEW.BAR,
            metric: CONST.SEARCH.CHART_METRIC.DURATION,
            stages: WORKFLOW_STAGES,
        },
        supportingCharts: [
            {
                graphKey: CONST.INSIGHTS.GRAPH.AVERAGE_PROCESSING_TIME,
                titleKey: 'insightsPage.averageProcessingTime',
                view: CONST.SEARCH.VIEW.BAR,
                groupBy: CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE,
                metric: CONST.SEARCH.CHART_METRIC.DURATION,
                sortBy: CONST.SEARCH.SORT_BY_COLUMNS.AVERAGE_TIME,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                stages: WORKFLOW_STAGES,
            },
            {
                graphKey: CONST.INSIGHTS.GRAPH.LONGEST_TO_SUBMIT,
                titleKey: 'insightsPage.longestToSubmit',
                workflowStage: CONST.SEARCH.WORKFLOW_STAGES.CREATED_SUBMITTED,
                view: CONST.SEARCH.VIEW.BAR,
                groupBy: CONST.SEARCH.GROUP_BY.FROM,
                metric: CONST.SEARCH.CHART_METRIC.DURATION,
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
                metric: CONST.SEARCH.CHART_METRIC.DURATION,
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
                metric: CONST.SEARCH.CHART_METRIC.DURATION,
                isPolicyEligible: arePaymentsEnabled,
                sortBy: CONST.SEARCH.SORT_BY_COLUMNS.AVERAGE_TIME,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
            },
        ],
    },
    [CONST.INSIGHTS.DASHBOARD.COMPLIANCE]: {
        searchKey: CONST.INSIGHTS.SEARCH_KEY.COMPLIANCE,
        labelKey: 'insightsPage.compliance',
        isPolicyEligible: canViewAllPolicyData,
        queryType: CONST.SEARCH.DATA_TYPES.EXPENSE,
        requiresControlPlan: true,
        hasDetailsPanel: true,
        headlineChart: {
            graphKey: CONST.INSIGHTS.GRAPH.VIOLATIONS_OVER_TIME,
            titleKey: 'insightsPage.violationsOverTime',
            view: CONST.SEARCH.VIEW.LINE,
            ...VIOLATION_STAGE_FILTERS[CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED],
            hasViolationStageControl: true,
            metric: CONST.SEARCH.CHART_METRIC.COUNT,
        },
        supportingCharts: [
            {
                graphKey: CONST.INSIGHTS.GRAPH.VIOLATIONS_BY_SUBMITTER,
                violationStage: CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED,
                titleKey: 'insightsPage.violationsBySubmitter',
                ...VIOLATION_STAGE_FILTERS[CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED],
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
                violationStage: CONST.INSIGHTS.VIOLATION_STAGE.APPROVED,
                titleKey: 'insightsPage.violationsByApprover',
                ...VIOLATION_STAGE_FILTERS[CONST.INSIGHTS.VIOLATION_STAGE.APPROVED],
                view: CONST.SEARCH.VIEW.BAR,
                groupBy: CONST.SEARCH.GROUP_BY.APPROVER,
                metric: CONST.SEARCH.CHART_METRIC.COUNT,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
                isPolicyEligible: (policy) => hasMultipleMembers(policy) && areApprovalsEnabled(policy),
            },
            {
                graphKey: CONST.INSIGHTS.GRAPH.TOP_VIOLATIONS,
                titleKey: 'insightsPage.topViolations',
                ...VIOLATION_STAGE_FILTERS[CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED],
                hasViolationStageControl: true,
                view: CONST.SEARCH.VIEW.TABLE,
                isFullWidth: true,
                groupBy: CONST.SEARCH.GROUP_BY.VIOLATION,
                metric: CONST.SEARCH.CHART_METRIC.COUNT,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: 15,
            },
        ],
    },
};

/** Drops the workflow-stage groups of stages no workspace in scope is eligible for, so the chart agrees with the others showing those stages */
function keepEnabledStageGroups(rows: GroupedItem[] | undefined, stages: InsightsChartStage[] | undefined): GroupedItem[] | undefined {
    if (!rows || !stages) {
        return rows;
    }
    const enabledStages = new Set(stages.map(({workflowStage}) => workflowStage));
    return rows.filter((item) => !('workflowStage' in item) || enabledStages.has(item.workflowStage));
}

/** Whether the chart stacks its stages in each time bucket's column, rather than drawing them as its groups */
function isStackedChart(chart: InsightsChartSpec): boolean {
    return !!chart.stages && chart.groupBy !== CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE;
}

/** Whether the workspace filter covers the workspace. No selected workspaces means every workspace is in scope. */
function isPolicyIDInScope(policyID: string, policyIDs: string[]): boolean {
    return policyIDs.length === 0 || policyIDs.includes(policyID);
}

/** Returns the workspaces the filter leaves in scope */
function getPoliciesInScope(policies: OnyxCollection<Policy>, policyIDs: string[]): Policy[] {
    return Object.values(policies ?? {}).filter((policy): policy is Policy => !!policy && isPolicyIDInScope(policy.id, policyIDs));
}

/**
 * Returns the charts or stages that at least one workspace in scope is eligible for.
 * A dashboard's own eligibility narrows the scope too, so a chart or stage only counts the workspaces the dashboard reports on.
 */
function filterEligible<T extends {isPolicyEligible?: PolicyEligibilityCheck}>(
    items: T[],
    policiesInScope: Policy[],
    login: string | undefined,
    isDashboardPolicyEligible?: PolicyEligibilityCheck,
): T[] {
    const dashboardPolicies = isDashboardPolicyEligible ? policiesInScope.filter((policy) => isDashboardPolicyEligible(policy, login)) : policiesInScope;
    return items.filter(({isPolicyEligible}) => !isPolicyEligible || dashboardPolicies.some((policy) => isPolicyEligible(policy, login)));
}

/** Returns the charts that at least one workspace in scope is eligible for */
function getVisibleCharts(charts: InsightsChartSpec[], policiesInScope: Policy[], login: string | undefined, isDashboardPolicyEligible?: PolicyEligibilityCheck): InsightsChartSpec[] {
    return filterEligible(charts, policiesInScope, login, isDashboardPolicyEligible);
}

/**
 * Returns the stages of a chart that at least one workspace in scope is eligible for, by the same rule as the charts themselves,
 * so a stage left out of one chart is left out of every chart showing it. Undefined for a chart that declares no stages.
 */
function getEnabledStages(
    chart: InsightsChartSpec,
    policiesInScope: Policy[],
    login: string | undefined,
    isDashboardPolicyEligible?: PolicyEligibilityCheck,
): InsightsChartStage[] | undefined {
    return chart.stages && filterEligible(chart.stages, policiesInScope, login, isDashboardPolicyEligible);
}

/**
 * Returns the workspace IDs `shouldUpsellControlPlan` reads.
 * A Control workspace only counts when it would produce charts, so archived ones and ones the user can see no data for are ignored.
 * Undefined for a dashboard that doesn't need Control.
 */
function getControlPlanCoverage(dashboardID: InsightsDashboardID, policies: OnyxCollection<Policy>, login: string | undefined): InsightsControlPlanCoverage | undefined {
    const {requiresControlPlan, isPolicyEligible} = INSIGHTS_DASHBOARD_SPECS[dashboardID];
    if (!requiresControlPlan) {
        return undefined;
    }
    const loadedPolicies = getPoliciesInScope(policies, []);
    return {
        policyIDs: loadedPolicies.map((policy) => policy.id),
        eligibleControlPolicyIDs: loadedPolicies
            .filter((policy) => isControlPolicy(policy) && !isArchivedOrPendingDeletePolicy(policy) && (!isPolicyEligible || isPolicyEligible(policy, login)))
            .map((policy) => policy.id),
    };
}

/**
 * Whether the dashboard needs Control but no workspace the filter leaves in scope can feed it, so the upsell stands in for the charts.
 * A stored filter can still hold workspaces that left Onyx. When none of its workspaces are left, it says nothing about the user's plans, so the dashboard keeps its usual states.
 */
function shouldUpsellControlPlan(coverage: InsightsControlPlanCoverage | undefined, policyIDs: string[]): boolean {
    if (!coverage) {
        return false;
    }
    if (policyIDs.length === 0) {
        return coverage.eligibleControlPolicyIDs.length === 0;
    }
    if (!policyIDs.some((policyID) => coverage.policyIDs.includes(policyID))) {
        return false;
    }
    return !policyIDs.some((policyID) => coverage.eligibleControlPolicyIDs.includes(policyID));
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
 * Returns the chart keys, stages and workspace IDs the dashboard renders from the workspaces in scope.
 * It holds no policies, so a selector returning it only renders the dashboard when one of these changes.
 */
function getScopeEligibility(dashboardID: InsightsDashboardID, policies: OnyxCollection<Policy>, policyIDs: string[], login: string | undefined): InsightsScopeEligibility {
    const {headlineChart, supportingCharts, isPolicyEligible} = INSIGHTS_DASHBOARD_SPECS[dashboardID];
    const policiesInScope = getPoliciesInScope(policies, policyIDs);
    const enabledStages: InsightsScopeEligibility['enabledStages'] = {};
    for (const chart of [headlineChart, ...supportingCharts]) {
        const stages = getEnabledStages(chart, policiesInScope, login, isPolicyEligible);
        if (stages) {
            enabledStages[chart.graphKey] = stages.map(({workflowStage}) => workflowStage);
        }
    }
    return {
        visibleGraphKeys: getVisibleCharts(supportingCharts, policiesInScope, login, isPolicyEligible).map(({graphKey}) => graphKey),
        enabledStages,
        upgradeablePolicyIDs: getUpgradeablePolicyIDsInScope(policiesInScope, login),
    };
}

/**
 * Returns the dashboards the user can open, ignoring the workspace filter.
 * Workspaces deleted offline stay in Onyx until the server confirms, so they don't count, or a dashboard would vanish only on reconnect.
 */
function getAccessibleDashboards(policies: OnyxCollection<Policy>, login: string | undefined): InsightsDashboardID[] {
    const activePolicies = Object.values(policies ?? {}).filter((policy): policy is Policy => !!policy && !isArchivedOrPendingDeletePolicy(policy));
    return Object.values(CONST.INSIGHTS.DASHBOARD).filter((dashboardID) => {
        const {isPolicyEligible} = INSIGHTS_DASHBOARD_SPECS[dashboardID];
        return !isPolicyEligible || activePolicies.some((policy) => isPolicyEligible(policy, login));
    });
}

/** Points a chart with a violation stage control at the stage the user picked. Other charts, or no pick yet, keep the chart as declared. */
function applyViolationStage(chart: InsightsChartSpec, stage: InsightsViolationStage | undefined): InsightsChartSpec {
    if (!chart.hasViolationStageControl || !stage) {
        return chart;
    }
    return {...chart, ...VIOLATION_STAGE_FILTERS[stage]};
}

/** Returns the dashboard's chart with the given graph key, pointed at the given violation stage. */
function getChartSpec(dashboardID: InsightsDashboardID, graphKey: string, stage: InsightsViolationStage | undefined): InsightsChartSpec | undefined {
    const {headlineChart, supportingCharts} = INSIGHTS_DASHBOARD_SPECS[dashboardID];
    const chart = [headlineChart, ...supportingCharts].find((spec) => spec.graphKey === graphKey);
    if (!chart) {
        return undefined;
    }
    return applyViolationStage(chart, stage);
}

/** Returns the stage a chart with a violation stage control counts, the submitters' until the user picks one. Other charts have none. */
function getViolationStage(chart: InsightsChartSpec, violationStages: InsightsViolationStages): InsightsViolationStage | undefined {
    if (!chart.hasViolationStageControl) {
        return undefined;
    }
    return violationStages[chart.graphKey] ?? CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED;
}

export {
    applyViolationStage,
    getAccessibleDashboards,
    getChartSpec,
    getControlPlanCoverage,
    getEnabledStages,
    getPoliciesInScope,
    getScopeEligibility,
    getUpgradeablePolicyIDsInScope,
    getViolationStage,
    getVisibleCharts,
    isPolicyIDInScope,
    isStackedChart,
    keepEnabledStageGroups,
    shouldUpsellControlPlan,
    VIOLATION_HAS_VALUES,
};
export type {InsightsChartSpec, InsightsChartStage, InsightsControlPlanCoverage, InsightsDateFilterKey, InsightsScopeEligibility, InsightsViolationStage, InsightsViolationStages};
export default INSIGHTS_DASHBOARD_SPECS;
