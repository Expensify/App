/** Declares the charts each Insights dashboard renders and how they map to backend graph slots and search views. */

import type {ChartView, SearchGroupBy} from '@components/Search/types';

import {canEditWorkspaceSettings} from '@libs/PolicyUtils/permissions';
import {isControlPolicy, isGroupPolicy} from '@libs/PolicyUtils/policyType';
import {isPolicyEligibleForTopCategories, isPolicyEligibleForTopSpenders} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Beta, InsightsDashboardID, InsightsGraphKey, InsightsSearchKey, Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {canViewAllPolicyData} from './insightsAccess';

type InsightsChartSpec = {
    /** Slot the request names the chart's snapshot under, and the response's `graphs` confirms it in */
    graphKey: InsightsGraphKey;
    titleKey: TranslationPaths;
    view: ChartView;

    /** What the chart aggregates by, left out by charts that follow the page's group-by filter */
    groupBy?: SearchGroupBy;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;

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
        requiresControlPlan: true,
        headlineChart: {
            graphKey: CONST.INSIGHTS.GRAPH.VIOLATIONS_OVER_TIME,
            titleKey: 'insightsPage.compliance',
            view: CONST.SEARCH.VIEW.LINE,
        },
        supportingCharts: [],
    },
};

/** Returns the workspaces the filter leaves in scope. No selected workspaces means every workspace is in scope. */
function getPoliciesInScope(policies: OnyxCollection<Policy>, policyIDs: string[]): Policy[] {
    return Object.values(policies ?? {}).filter((policy): policy is Policy => !!policy && (policyIDs.length === 0 || policyIDs.includes(policy.id)));
}

/** Returns the charts that at least one workspace in scope is eligible for. */
function getVisibleCharts(charts: InsightsChartSpec[], policies: OnyxCollection<Policy>, policyIDs: string[], login: string | undefined): InsightsChartSpec[] {
    const policiesInScope = getPoliciesInScope(policies, policyIDs);
    return charts.filter(({isPolicyEligible}) => !isPolicyEligible || policiesInScope.some((policy) => isPolicyEligible(policy, login)));
}

/** Whether the dashboard needs Control but no workspace in scope is on it, so the upsell stands in for the charts. */
function shouldUpsellControlPlan(dashboardID: InsightsDashboardID, policies: OnyxCollection<Policy>, policyIDs: string[]): boolean {
    if (!INSIGHTS_DASHBOARD_SPECS[dashboardID].requiresControlPlan) {
        return false;
    }
    return !getPoliciesInScope(policies, policyIDs).some(isControlPolicy);
}

/**
 * The workspace the upsell's CTA pre-selects: the one in scope the user could actually upgrade.
 * Returns undefined when none or several qualify, leaving the upgrade flow to ask which one.
 *
 * Eligibility mirrors `canEditWorkspaceSettings`, which is what the upgrade page itself gates on. Pre-selecting a
 * workspace that fails it drops the user on a not-found page instead of the upgrade flow.
 */
function getUpgradeablePolicyIDInScope(policies: OnyxCollection<Policy>, policyIDs: string[], login: string | undefined): string | undefined {
    const upgradeable = getPoliciesInScope(policies, policyIDs).filter((policy) => isGroupPolicy(policy) && !isControlPolicy(policy) && canEditWorkspaceSettings(policy, login));
    return upgradeable.length === 1 ? upgradeable.at(0)?.id : undefined;
}

/** Returns the dashboards the user can open, ignoring the workspace filter. */
function getAccessibleDashboards(policies: OnyxCollection<Policy>, login: string | undefined, isBetaEnabled: (beta: Beta) => boolean): InsightsDashboardID[] {
    const allPolicies = Object.values(policies ?? {});
    return Object.values(CONST.INSIGHTS.DASHBOARD).filter((dashboardID) => {
        const {beta, isPolicyEligible} = INSIGHTS_DASHBOARD_SPECS[dashboardID];
        return (!beta || isBetaEnabled(beta)) && (!isPolicyEligible || allPolicies.some((policy) => !!policy && isPolicyEligible(policy, login)));
    });
}

export {getAccessibleDashboards, getUpgradeablePolicyIDInScope, getVisibleCharts, shouldUpsellControlPlan};
export type {InsightsChartSpec};
export default INSIGHTS_DASHBOARD_SPECS;
