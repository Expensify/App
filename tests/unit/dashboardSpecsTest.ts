import INSIGHTS_DASHBOARD_SPECS, {getDetailsChartSpec, getPoliciesInScope, getVisibleCharts} from '@pages/Insights/dashboardSpecs';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import createRandomPolicy from '../utils/collections/policies';

describe('Insights dashboard charts', () => {
    it('uses the same pie chart configuration for Top tags and Top categories', () => {
        // Given the Spend dashboard's ranking charts.
        const charts = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND].supportingCharts;

        // When selecting the category and tag charts.
        const categoryChart = charts.find(({graphKey}) => graphKey === CONST.INSIGHTS.GRAPH.TOP_CATEGORIES);
        const tagChart = charts.find(({graphKey}) => graphKey === CONST.INSIGHTS.GRAPH.TOP_TAGS);

        // Then both use donuts, with single-result and comparison fallbacks handled by the shared chart components.
        expect(categoryChart?.view).toBe(CONST.SEARCH.VIEW.PIE);
        expect(tagChart?.view).toBe(CONST.SEARCH.VIEW.PIE);
    });

    it.each([
        {policyIDs: [], type: CONST.POLICY.TYPE.CORPORATE, areTagsEnabled: true, shouldShowTags: true},
        {policyIDs: ['enabled'], type: CONST.POLICY.TYPE.CORPORATE, areTagsEnabled: true, shouldShowTags: true},
        {policyIDs: ['disabled'], type: CONST.POLICY.TYPE.CORPORATE, areTagsEnabled: true, shouldShowTags: false},
        {policyIDs: [], type: CONST.POLICY.TYPE.CORPORATE, areTagsEnabled: false, shouldShowTags: false},
        {policyIDs: [], type: CONST.POLICY.TYPE.PERSONAL, areTagsEnabled: true, shouldShowTags: false},
    ])('shows tags=$shouldShowTags for scope=$policyIDs, type=$type, enabled=$areTagsEnabled', ({policyIDs, type, areTagsEnabled, shouldShowTags}) => {
        // Given one potentially eligible workspace and one with tags disabled
        const policies = {
            [`${ONYXKEYS.COLLECTION.POLICY}enabled`]: {...createRandomPolicy(1, type), id: 'enabled', areTagsEnabled},
            [`${ONYXKEYS.COLLECTION.POLICY}disabled`]: {...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE), id: 'disabled', areTagsEnabled: false},
        };

        // When the dashboard selects charts for the chosen workspace scope
        const charts = getVisibleCharts(INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND].supportingCharts, getPoliciesInScope(policies, policyIDs), undefined);

        // Then Top tags requires a group workspace with tags enabled in that scope
        expect(charts.some(({graphKey}) => graphKey === CONST.INSIGHTS.GRAPH.TOP_TAGS)).toBe(shouldShowTags);
    });

    it('points a Details panel chart at the violation stage in its URL', () => {
        // Given a Details panel URL for Top violations with the approved stage picked
        const graphKey = CONST.INSIGHTS.GRAPH.TOP_VIOLATIONS;

        // When resolving the chart the panel shows
        const chart = getDetailsChartSpec(CONST.INSIGHTS.DASHBOARD.COMPLIANCE, graphKey, CONST.INSIGHTS.VIOLATION_STAGE.APPROVED);

        // Then the panel counts the approvers' violations by approval date, as the chart did when clicked
        expect(chart?.graphKey).toBe(graphKey);
        expect(chart?.dateFilterKey).toBe(CONST.SEARCH.SYNTAX_FILTER_KEYS.ANY_APPROVAL);
        expect(chart?.has).toEqual([CONST.SEARCH.HAS_VALUES.APPROVED_VIOLATION]);
    });

    it('keeps a Details panel chart as declared when its URL has no valid stage', () => {
        // Given a Details panel URL for Top violations with a stage that doesn't exist
        const declared = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.COMPLIANCE].supportingCharts.find(({graphKey}) => graphKey === CONST.INSIGHTS.GRAPH.TOP_VIOLATIONS);

        // When resolving the chart the panel shows
        const chart = getDetailsChartSpec(CONST.INSIGHTS.DASHBOARD.COMPLIANCE, CONST.INSIGHTS.GRAPH.TOP_VIOLATIONS, 'unknown');

        // Then the panel falls back to the chart's default, the submitters' stage
        expect(chart).toBe(declared);
    });

    it("returns no Details panel chart for a graph that isn't on the dashboard", () => {
        // Given a Details panel URL naming a Spend graph under the Compliance dashboard
        // When resolving the chart the panel shows
        const chart = getDetailsChartSpec(CONST.INSIGHTS.DASHBOARD.COMPLIANCE, CONST.INSIGHTS.GRAPH.TOP_MERCHANTS, undefined);

        // Then there is none, so the panel shows the not found page
        expect(chart).toBeUndefined();
    });
});
