import {makeRequestWithSideEffects} from '@libs/API';
import {getServerAnchoredDBTime} from '@libs/NetworkState';

import {preloadInsightsExplanation} from '@userActions/Insights';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

jest.mock('@libs/API', () => ({makeRequestWithSideEffects: jest.fn(), waitForWrites: jest.fn(() => Promise.resolve()), write: jest.fn()}));

describe('preloadInsightsExplanation', () => {
    afterEach(() => jest.clearAllMocks());

    it('shares generation between a background request and an early click', async () => {
        // Given the same explanation is requested while its response is still in flight.
        jest.mocked(makeRequestWithSideEffects).mockResolvedValue({
            jsonCode: 200,
            onyxData: [
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.INSIGHTS_EXPLANATION}123`,
                    value: {jsonQuery: 'same-query', response: '<p>Answer</p>', createdAt: getServerAnchoredDBTime()},
                },
            ],
        });

        // When the page and click request that answer together.
        const background = preloadInsightsExplanation('same-query', 123);
        const click = preloadInsightsExplanation('same-query', 123);

        // Then both receive the same response and only one API call runs.
        expect(click).toBe(background);
        await expect(click).resolves.toBe('<p>Answer</p>');
        expect(makeRequestWithSideEffects).toHaveBeenCalledTimes(1);
    });

    it('releases a failed request so a subsequent click can retry', async () => {
        // Given a network rejection rather than a reusable answer.
        jest.mocked(makeRequestWithSideEffects).mockRejectedValueOnce(new Error('Network failed'));

        // When background generation fails, then keep the live fallback available.
        await expect(preloadInsightsExplanation('failed-query', 456)).resolves.toBeUndefined();

        // When the user tries again, then a new attempt can run instead of reusing the rejection.
        jest.mocked(makeRequestWithSideEffects).mockResolvedValueOnce({jsonCode: 500});
        await expect(preloadInsightsExplanation('failed-query', 456)).resolves.toBeUndefined();
        expect(makeRequestWithSideEffects).toHaveBeenCalledTimes(2);
    });
});
