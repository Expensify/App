import {renderHook} from '@testing-library/react-native';

import useShownAIInsights from '@pages/Insights/ai/useShownAIInsights';
import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';

import CONST from '@src/CONST';
import type {AIInsight, InsightsDashboardID} from '@src/types/onyx';

type HookProps = {
    dashboardID: InsightsDashboardID;
    filters: InsightsFilters;
    insights: AIInsight[] | undefined;
};

const FILTERS: InsightsFilters = {
    date: {preset: CONST.SEARCH.DATE_PRESETS.THIS_MONTH},
    policyIDs: ['policy1'],
    groupBy: CONST.SEARCH.GROUP_BY.DAY,
    groupCurrency: 'USD',
    compare: CONST.SEARCH.COMPARE.PREVIOUS_PERIOD,
    tagLevel: 1,
};

function buildInsight(id: string, title: string): AIInsight {
    return {
        id,
        signal: CONST.INSIGHTS.AI_INSIGHT.SIGNAL.SPIKE,
        title,
        chip: {type: CONST.INSIGHTS.AI_INSIGHT.CHIP_TYPE.CHANGE, direction: CONST.INSIGHTS.AI_INSIGHT.CHIP_DIRECTION.INCREASE, unit: CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT.PERCENT, value: 20},
        summary: `${title} summary`,
        explainPrompt: `Explain ${title}`,
    };
}

const INSIGHTS = [buildInsight('1', 'Travel spike')];

function renderShownAIInsights(initialProps: HookProps) {
    return renderHook(({dashboardID, filters, insights}: HookProps) => useShownAIInsights(dashboardID, filters, insights), {initialProps});
}

describe('useShownAIInsights', () => {
    it('builds the scope from the filters the AI cards depend on', () => {
        // Given the Spend dashboard with its AI cards loaded
        const {result} = renderShownAIInsights({dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, filters: FILTERS, insights: INSIGHTS});

        // Then the cards come with a scope of the dashboard's search key, workspaces, date, currency and tag level
        expect(result.current).toEqual({
            scope: {
                searchKey: INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND].searchKey,
                policyIDs: FILTERS.policyIDs,
                date: FILTERS.date,
                groupCurrency: FILTERS.groupCurrency,
                tagLevel: FILTERS.tagLevel,
            },
            insights: INSIGHTS,
        });
    });

    it('leaves the tag level out of the scope on dashboards other than Spend', () => {
        // Given the Compliance dashboard, which has no tag level control
        const {result} = renderShownAIInsights({dashboardID: CONST.INSIGHTS.DASHBOARD.COMPLIANCE, filters: FILTERS, insights: INSIGHTS});

        // Then the scope doesn't include the tag level
        expect(result.current.scope).not.toHaveProperty('tagLevel');
    });

    it('shows no cards while the first entry is loading', () => {
        // Given a dashboard whose AI cards haven't been written yet
        const {result} = renderShownAIInsights({dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, filters: FILTERS, insights: undefined});

        // Then there are no cards to show
        expect(result.current.insights).toBeUndefined();
    });

    it('keeps the shown cards while an entry of the same scope is loading', () => {
        // Given loaded AI cards
        const {result, rerender} = renderShownAIInsights({dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, filters: FILTERS, insights: INSIGHTS});

        // When the user changes the date grouping, which the cards don't depend on, and the new entry has no cards yet
        rerender({dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, filters: {...FILTERS, groupBy: CONST.SEARCH.GROUP_BY.WEEK}, insights: undefined});

        // Then the previous cards stay on screen
        expect(result.current.insights).toBe(INSIGHTS);
    });

    it('hides the shown cards while an entry of another scope is loading', () => {
        // Given loaded AI cards
        const {result, rerender} = renderShownAIInsights({dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, filters: FILTERS, insights: INSIGHTS});

        // When the user picks other workspaces and the new entry has no cards yet
        const filters = {...FILTERS, policyIDs: ['policy2']};
        rerender({dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, filters, insights: undefined});

        // Then the old cards are hidden, because they were written for other workspaces
        expect(result.current.insights).toBeUndefined();
        expect(result.current.scope.policyIDs).toEqual(filters.policyIDs);
    });

    it('hides the shown cards on Spend while an entry of another tag level is loading', () => {
        // Given loaded AI cards on Spend
        const {result, rerender} = renderShownAIInsights({dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, filters: FILTERS, insights: INSIGHTS});

        // When the user picks another tag level and the new entry has no cards yet
        rerender({dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, filters: {...FILTERS, tagLevel: 2}, insights: undefined});

        // Then the old cards are hidden, because Spend cards depend on the tag level
        expect(result.current.insights).toBeUndefined();
    });

    it('shows new cards when they change within the same scope', () => {
        // Given loaded AI cards
        const {result, rerender} = renderShownAIInsights({dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, filters: FILTERS, insights: INSIGHTS});

        // When an entry of the same scope loads with other cards
        const newInsights = [buildInsight('2', 'Meals trend')];
        rerender({dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, filters: {...FILTERS, groupBy: CONST.SEARCH.GROUP_BY.WEEK}, insights: newInsights});

        // Then the new cards replace the old ones
        expect(result.current.insights).toBe(newInsights);
    });

    it('keeps the same result when an entry of the same scope loads with equal cards', () => {
        // Given loaded AI cards
        const {result, rerender} = renderShownAIInsights({dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, filters: FILTERS, insights: INSIGHTS});
        const shownInsights = result.current;

        // When an entry of the same scope loads with cards equal by value
        rerender({dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, filters: {...FILTERS, groupBy: CONST.SEARCH.GROUP_BY.WEEK}, insights: INSIGHTS.map((insight) => ({...insight}))});

        // Then the result keeps its reference, so the cards don't re-render
        expect(result.current).toBe(shownInsights);
    });

    it('shows the cards of a new scope once they load', () => {
        // Given loaded AI cards
        const {result, rerender} = renderShownAIInsights({dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, filters: FILTERS, insights: INSIGHTS});

        // When the user picks another currency and its entry loads with cards
        const filters = {...FILTERS, groupCurrency: 'EUR'};
        const newInsights = [buildInsight('3', 'Software record')];
        rerender({dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, filters, insights: newInsights});

        // Then the new cards show with the new scope
        expect(result.current.insights).toBe(newInsights);
        expect(result.current.scope.groupCurrency).toBe('EUR');
    });
});
