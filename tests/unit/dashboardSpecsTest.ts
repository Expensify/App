import INSIGHTS_DASHBOARD_SPECS, {getVisibleCharts} from '@pages/Insights/dashboardSpecs';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import createRandomPolicy from '../utils/collections/policies';

describe('Insights dashboard charts', () => {
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
        const charts = getVisibleCharts(INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND].supportingCharts, policies, policyIDs, undefined);

        // Then Top tags requires a group workspace with tags enabled in that scope
        expect(charts.some(({graphKey}) => graphKey === CONST.INSIGHTS.GRAPH.TOP_TAGS)).toBe(shouldShowTags);
    });
});
