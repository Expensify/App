import INSIGHTS_DASHBOARD_SPECS, {getPoliciesInScope, getVisibleCharts} from '@pages/Insights/dashboardSpecs';

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
});
