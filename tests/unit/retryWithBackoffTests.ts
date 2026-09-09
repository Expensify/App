/**
 * @jest-environment node
 */
import retryWithBackoff from '../../scripts/utils/retryWithBackoff';

describe('retryWithBackoff', () => {
    it('resolves on first attempt', async () => {
        const fn = jest.fn().mockResolvedValue('success');

        const promise = retryWithBackoff(fn);
        await expect(promise).resolves.toBe('success');

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('resolves after a few failures', async () => {
        const fn = jest.fn().mockRejectedValueOnce(new Error('Fail 1')).mockRejectedValueOnce(new Error('Fail 2')).mockResolvedValue('Recovered');

        const promise = retryWithBackoff(fn, {initialDelayMs: 16});
        await expect(promise).resolves.toBe('Recovered');

        expect(fn).toHaveBeenCalledTimes(3);
    });

    it('throws after exceeding maxRetries', async () => {
        const fn = jest.fn().mockRejectedValue(new Error('Fail always'));

        const promise = retryWithBackoff(fn, {initialDelayMs: 16, maxRetries: 2});
        await expect(promise).rejects.toThrow('Fail always');

        expect(fn).toHaveBeenCalledTimes(3); // Initial try + 2 retries
    });

    it('respects isRetryable function', async () => {
        const nonRetryableError = new Error('Don’t retry');
        const fn = jest.fn().mockRejectedValue(nonRetryableError);

        const isRetryable = jest.fn().mockReturnValue(false);

        const promise = retryWithBackoff(fn, {initialDelayMs: 16, isRetryable});
        await expect(promise).rejects.toThrow('Don’t retry');

        expect(fn).toHaveBeenCalledTimes(1);
        expect(isRetryable).toHaveBeenCalledWith(nonRetryableError);
    });

    it('uses exponential backoff', async () => {
        const fn = jest.fn().mockRejectedValueOnce(new Error('Fail 1')).mockRejectedValueOnce(new Error('Fail 2')).mockResolvedValue('Done');

        jest.useFakeTimers();
        try {
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
            const promise = retryWithBackoff(fn, {
                maxRetries: 5,
                initialDelayMs: 100,
                factor: 3,
            });

            await jest.runAllTimersAsync();
            await expect(promise).resolves.toBe('Done');
            expect(fn).toHaveBeenCalledTimes(3);
            expect(setTimeoutSpy.mock.calls.map(([, delay]) => delay)).toEqual([100, 300]);
        } finally {
            jest.useRealTimers();
        }
    });
});
