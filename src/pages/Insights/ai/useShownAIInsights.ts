import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';

import CONST from '@src/CONST';
import type {AIInsight, InsightsDashboardID, InsightsScope} from '@src/types/onyx';

import {deepEqual} from 'fast-equals';
import {useState} from 'react';

/** Builds the filters for the AI cards */
function buildInsightsScope(dashboardID: InsightsDashboardID, filters: InsightsFilters): InsightsScope {
    return {
        searchKey: INSIGHTS_DASHBOARD_SPECS[dashboardID].searchKey,
        policyIDs: filters.policyIDs,
        date: filters.date,
        groupCurrency: filters.groupCurrency,
        ...(dashboardID === CONST.INSIGHTS.DASHBOARD.SPEND && {tagLevel: filters.tagLevel}),
    };
}

/** AI insights and the scope they were written for */
type AIInsightsWithScope = {
    scope: InsightsScope;
    insights: AIInsight[] | undefined;
};

function useShownAIInsights(dashboardID: InsightsDashboardID, filters: InsightsFilters, currentEntryInsights: AIInsight[] | undefined): AIInsightsWithScope {
    const scope = buildInsightsScope(dashboardID, filters);
    const [shownInsights, setShownInsights] = useState<AIInsightsWithScope>();

    if (shownInsights && deepEqual(shownInsights.scope, scope)) {
        return shownInsights;
    }

    const currentInsights = {scope, insights: currentEntryInsights};
    if (currentEntryInsights !== undefined) {
        setShownInsights(currentInsights);
    }
    return currentInsights;
}

export default useShownAIInsights;
