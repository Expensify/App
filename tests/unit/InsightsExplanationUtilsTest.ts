import DateUtils from '@libs/DateUtils';
import {buildInsightsExplanationQuery, getCachedInsightsExplanation} from '@libs/InsightsExplanationUtils';
import {getDBTimeWithSkew} from '@libs/NetworkState';

import CONST from '@src/CONST';

describe('InsightsExplanationUtils', () => {
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

    it('rejects stale, future, missing, or mismatched cached answers', () => {
        // Given a cached answer with a server-clock timestamp.
        const explanation = {jsonQuery: 'query', response: 'Answer', createdAt: getDBTimeWithSkew()};

        // When selecting an answer, then only a fresh exact match can be displayed immediately.
        expect(getCachedInsightsExplanation(explanation, 'query')).toBe('Answer');
        expect(getCachedInsightsExplanation(explanation, 'another query')).toBeUndefined();
        expect(getCachedInsightsExplanation(undefined, 'query')).toBeUndefined();
        expect(getCachedInsightsExplanation({...explanation, createdAt: DateUtils.subtractMillisecondsFromDateTime(explanation.createdAt, 5 * 60 * 1000)}, 'query')).toBeUndefined();
        expect(getCachedInsightsExplanation({...explanation, createdAt: DateUtils.addMillisecondsFromDateTime(explanation.createdAt, 60 * 1000)}, 'query')).toBeUndefined();
    });
});
