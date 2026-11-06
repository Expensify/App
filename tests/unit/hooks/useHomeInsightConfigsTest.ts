import {renderHook, waitFor} from '@testing-library/react-native';

import useHomeInsightConfigs from '@pages/home/InsightsSection/useHomeInsightConfigs';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

describe('Home tag insight', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    afterEach(() => Onyx.clear());

    it('offers Top tags with the saved dashboard level and five-group limit', async () => {
        // Given a tags-enabled workspace and level two saved on the Spend dashboard
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}A1`, {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), id: 'A1', areTagsEnabled: true});
        await Onyx.set(ONYXKEYS.SEARCH_FILTERS, {insightsSpend: {query: 'groupBy:month tagLevel:2 groupCurrency:USD policyID:A1 date:last-month'}});
        await waitForBatchedUpdates();

        // When Home builds its insight choices
        const {result} = renderHook(() => useHomeInsightConfigs());
        await waitFor(() => expect(result.current.isResolved).toBe(true));
        const tags = result.current.configs.find((config) => config.key === CONST.INSIGHTS.GRAPH.TOP_TAGS);

        // Then the widget uses the same positional scope as Insights, not a legacy full-tag query
        expect(tags?.icon).toBe('Tag');
        expect(tags?.searchQueryJSON).toMatchObject({groupBy: 'tag', tagLevel: 2, limit: CONST.SEARCH.TOP_SEARCH_LIMIT, view: CONST.SEARCH.VIEW.PIE});
        expect(tags?.searchQuery).toContain('policyID:A1');
        expect(result.current.tagPolicyIDs).toEqual(['A1']);
    });
});
