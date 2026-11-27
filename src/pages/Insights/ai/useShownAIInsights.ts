import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import type {InsightsTimeGroupBy} from '@pages/Insights/insightsGroupByUtils';
import {getQueryGroupBy} from '@pages/Insights/insightsGroupByUtils';

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

/** Shown AI insights, with the scope and date grouping they were written for */
type ShownAIInsights = {
    /** Filters the cards were written for, sent to Concierge when the user asks to explain */
    scope: InsightsScope;

    /** Card's insights to show, undefined while the first entry of the scope is still loading */
    insights: AIInsight[] | undefined;

    /** Date grouping the cards were written for, since a new one brings new cards */
    groupBy: InsightsTimeGroupBy;
};

function useShownAIInsights(dashboardID: InsightsDashboardID, filters: InsightsFilters, currentEntryInsights: AIInsight[] | undefined): ShownAIInsights {
    const scope = buildInsightsScope(dashboardID, filters);
    const groupBy = getQueryGroupBy(filters);
    const [shownInsights, setShownInsights] = useState<ShownAIInsights>();
    // The cards are not written for the violation stage
    const isSameScope = !!shownInsights && shownInsights.groupBy === groupBy && deepEqual(shownInsights.scope, scope);

    if (currentEntryInsights === undefined) {
        return isSameScope ? shownInsights : {scope, insights: undefined, groupBy};
    }

    if (isSameScope && deepEqual(shownInsights.insights, currentEntryInsights)) {
        return shownInsights;
    }

    const currentInsights = {scope: isSameScope ? shownInsights.scope : scope, insights: currentEntryInsights, groupBy};
    setShownInsights(currentInsights);
    return currentInsights;
}

export default useShownAIInsights;
