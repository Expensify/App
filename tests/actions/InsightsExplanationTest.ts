import {makeRequestWithSideEffects} from '@libs/API';

import {preloadInsightsExplanation} from '@userActions/Insights';

jest.mock('@libs/API', () => ({makeRequestWithSideEffects: jest.fn(), waitForWrites: jest.fn(() => Promise.resolve()), write: jest.fn()}));

describe('preloadInsightsExplanation', () => {
    afterEach(() => jest.clearAllMocks());

    it('shares an in-flight request across background callers', async () => {
        // Given the same explanation is requested while its response is still in flight.
        jest.mocked(makeRequestWithSideEffects).mockResolvedValue({jsonCode: 200});

        // When two callers preload that answer together.
        const firstPreload = preloadInsightsExplanation('same-query', 123);
        const secondPreload = preloadInsightsExplanation('same-query', 123);

        // Then both share the same request and only one API call runs.
        expect(secondPreload).toBe(firstPreload);
        await secondPreload;
        expect(makeRequestWithSideEffects).toHaveBeenCalledTimes(1);
    });

    it('releases a failed request so a subsequent preload can run', async () => {
        // Given a network rejection rather than a reusable answer.
        jest.mocked(makeRequestWithSideEffects).mockRejectedValueOnce(new Error('Network failed'));

        // When background generation fails, then handle the rejection without throwing.
        await expect(preloadInsightsExplanation('failed-query', 456)).resolves.toBeUndefined();

        // When a new background preload starts, then it does not reuse the rejection.
        jest.mocked(makeRequestWithSideEffects).mockResolvedValueOnce({jsonCode: 500});
        await expect(preloadInsightsExplanation('failed-query', 456)).resolves.toBeUndefined();
        expect(makeRequestWithSideEffects).toHaveBeenCalledTimes(2);
    });
});
