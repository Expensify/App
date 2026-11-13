import DateUtils from '@libs/DateUtils';
import {buildInsightsExplanationQuery, getCachedInsightsExplanation} from '@libs/InsightsExplanationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('InsightsExplanationUtils', () => {
    afterEach(async () => {
        await Onyx.merge(ONYXKEYS.NETWORK, {timeSkew: 0});
        await waitForBatchedUpdates();
        jest.useRealTimers();
    });

    it('normalizes workspace order while keeping question, account, chat, and filters in the cache identity', () => {
        // Given the same workspace selection in different picker orders.
        const scope = {searchKey: CONST.INSIGHTS.SEARCH_KEY.SPEND, policyIDs: ['B', 'A'], date: {preset: 'year-to-date' as const}, groupCurrency: CONST.CURRENCY.USD};

        // When constructing cache identities, then equivalent scopes match and different contexts do not.
        const query = buildInsightsExplanationQuery(1, '100', ' Explain ', scope);
        expect(buildInsightsExplanationQuery(1, '100', 'Explain', {...scope, policyIDs: ['A', 'B']})).toBe(query);
        expect(buildInsightsExplanationQuery(2, '100', 'Explain', scope)).not.toBe(query);
        expect(buildInsightsExplanationQuery(1, '101', 'Explain', scope)).not.toBe(query);
        expect(buildInsightsExplanationQuery(1, '100', 'Another question', scope)).not.toBe(query);
        expect(buildInsightsExplanationQuery(1, '100', 'Explain', {...scope, date: {on: '2026-01-01'}})).not.toBe(query);
    });

    it.each([0, -10 * 60 * 1000, 10 * 60 * 1000])('rejects stale, future, missing, or mismatched cached answers with %i ms clock skew', async (timeSkew) => {
        // Given a server timestamp and a device clock up to ten minutes ahead or behind.
        const serverTime = Date.parse('2026-11-11T12:00:00.000Z');
        jest.useFakeTimers({now: serverTime - timeSkew});
        await Onyx.merge(ONYXKEYS.NETWORK, {timeSkew});
        await waitForBatchedUpdates();
        const explanation = {jsonQuery: 'query', response: 'Answer', createdAt: DateUtils.getDBTime(serverTime)};

        // When selecting an answer using its server timestamp.
        // Then only a fresh exact match can be displayed immediately, regardless of device clock skew.
        expect(getCachedInsightsExplanation(explanation, 'query')).toBe('Answer');
        expect(getCachedInsightsExplanation(explanation, 'another query')).toBeUndefined();
        expect(getCachedInsightsExplanation(undefined, 'query')).toBeUndefined();
        expect(getCachedInsightsExplanation({...explanation, createdAt: DateUtils.subtractMillisecondsFromDateTime(explanation.createdAt, 5 * 60 * 1000)}, 'query')).toBeUndefined();
        expect(getCachedInsightsExplanation({...explanation, createdAt: DateUtils.addMillisecondsFromDateTime(explanation.createdAt, 60 * 1000)}, 'query')).toBeUndefined();
    });
});
