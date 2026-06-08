/**
 * Regression tests for the Safari PWA ChunkLoadError crash loop.
 *
 * usePageRefresh: clears SW caches then reloads on any chunk-load error (the Refresh
 * button is only shown after the automatic lazyRetry cycle has already run, so we are
 * already on the second failure by the time the user taps it).
 *
 * lazyRetry uses a three-state strategy:
 *   - First failure                        → plain reload.
 *   - Second failure, ChunkLoadError, online → clear SW cache then reload.
 *   - Second failure, ChunkLoadError, offline→ reject to error boundary (keep cached offline assets).
 *   - Second failure, non-ChunkLoadError     → reject to error boundary.
 *   - Third failure                          → reject to error boundary (loop prevention).
 */
import {renderHook} from '@testing-library/react-native';
import type {ComponentType} from 'react';
import usePageRefresh from '@hooks/usePageRefresh';
import CONST from '@src/CONST';
import lazyRetry from '@src/utils/lazyRetry';

type ComponentImport<T> = () => Promise<{default: T}>;

const mockClearWorkboxRecoveryCaches = jest.fn();
jest.mock('@libs/clearWorkboxRecoveryCaches', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mock factory must return `any` to satisfy the dynamic module shape Jest expects
    default: (...args: unknown[]): any => mockClearWorkboxRecoveryCaches(...args),
}));

// jest-expo resolves @hooks/usePageRefresh to the .native.ts variant (which does not use
// clearWorkboxRecoveryCaches). Override the alias to load the web file so this test covers
// the web-specific reload path that was changed. The web file's own imports (including
// clearWorkboxRecoveryCaches) still go through the normal mock registry.
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- jest.requireActual returns an untyped module; the unsafe return is unavoidable here
jest.mock('@hooks/usePageRefresh', () => jest.requireActual('../../src/hooks/usePageRefresh/index.ts'));

jest.mock('react-error-boundary', () => ({
    useErrorBoundary: () => ({resetBoundary: jest.fn()}),
    ErrorBoundary: ({children}: {children: React.ReactNode}) => children,
}));

/**
 * Flush enough microtask turns to let clearWorkboxRecoveryCaches().then(reload)
 * run to completion. Two yields are sufficient: one for the rejection/resolution
 * handler, one for the .then() chain off the resolved clearWorkboxRecoveryCaches promise.
 */
function flushMicrotasks(turns = 3): Promise<void> {
    let chain = Promise.resolve();
    for (let i = 0; i < turns; i++) {
        chain = chain.then(() => Promise.resolve());
    }
    return chain;
}

describe('ChunkLoadError recovery', () => {
    let reloadMock: jest.Mock;
    // Records the order in which clear and reload are called within each test.
    const callOrder: string[] = [];
    // Preserve the original location so the override does not leak between test files.
    const originalLocation = window.location;

    beforeAll(() => {
        reloadMock = jest.fn().mockImplementation(() => {
            callOrder.push('reload');
        });
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {reload: reloadMock},
        });
    });

    afterAll(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: originalLocation,
        });
    });

    beforeEach(() => {
        callOrder.length = 0;
        mockClearWorkboxRecoveryCaches.mockImplementation(() => {
            callOrder.push('clear');
            return Promise.resolve();
        });
        reloadMock.mockClear();
        mockClearWorkboxRecoveryCaches.mockClear();
        sessionStorage.clear();
    });

    describe('usePageRefresh (web)', () => {
        it('clears caches before reloading when isChunkLoadError is true', async () => {
            const {result} = renderHook(() => usePageRefresh());

            result.current(true);
            await flushMicrotasks();

            expect(mockClearWorkboxRecoveryCaches).toHaveBeenCalledTimes(1);
            expect(reloadMock).toHaveBeenCalledTimes(1);
            expect(callOrder).toEqual(['clear', 'reload']);
        });

        it('does not reload at all when isChunkLoadError is false and no prior refresh', async () => {
            const {result} = renderHook(() => usePageRefresh());

            result.current(false);
            await flushMicrotasks();

            expect(mockClearWorkboxRecoveryCaches).not.toHaveBeenCalled();
            expect(reloadMock).not.toHaveBeenCalled();
        });

        it('plain-reloads without clearing caches when the error is not a chunk error', async () => {
            // Simulate a second Refresh tap within the timeout window for a non-chunk error.
            sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.LAST_REFRESH_TIMESTAMP, (Date.now() - 1000).toString());
            const {result} = renderHook(() => usePageRefresh());

            result.current(false);
            await flushMicrotasks();

            expect(mockClearWorkboxRecoveryCaches).not.toHaveBeenCalled();
            expect(reloadMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('lazyRetry', () => {
        const chunkError = Object.assign(new Error('Loading chunk 3851 failed.'), {name: 'ChunkLoadError'});
        // Retry state is scoped per import, so the test reads/writes the chunk-specific key.
        const RETRY_KEY = 'test';
        const stateKey = `${CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED}:${RETRY_KEY}`;

        it('plain-reloads on the first failure without clearing caches', async () => {
            sessionStorage.removeItem(stateKey);
            const failingImport = jest.fn().mockRejectedValue(chunkError) as unknown as ComponentImport<ComponentType>;

            lazyRetry(failingImport, RETRY_KEY);
            await flushMicrotasks();

            expect(reloadMock).toHaveBeenCalledTimes(1);
            expect(mockClearWorkboxRecoveryCaches).not.toHaveBeenCalled();
            expect(callOrder).toEqual(['reload']);
        });

        it('clears SW caches before reloading on the second ChunkLoadError failure when online', async () => {
            sessionStorage.setItem(stateKey, 'true');
            jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
            const failingImport = jest.fn().mockRejectedValue(chunkError) as unknown as ComponentImport<ComponentType>;

            lazyRetry(failingImport, RETRY_KEY);
            await flushMicrotasks();

            expect(mockClearWorkboxRecoveryCaches).toHaveBeenCalledTimes(1);
            expect(reloadMock).toHaveBeenCalledTimes(1);
            expect(callOrder).toEqual(['clear', 'reload']);
        });

        it('rejects to the error boundary on second ChunkLoadError failure when offline to preserve the offline cache', async () => {
            sessionStorage.setItem(stateKey, 'true');
            jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
            const failingImport = jest.fn().mockRejectedValue(chunkError) as unknown as ComponentImport<ComponentType>;

            await expect(lazyRetry(failingImport, RETRY_KEY)).rejects.toBeDefined();
            await flushMicrotasks();

            expect(mockClearWorkboxRecoveryCaches).not.toHaveBeenCalled();
            expect(reloadMock).not.toHaveBeenCalled();
        });

        it('rejects to the error boundary on second failure when the error is not a ChunkLoadError', async () => {
            sessionStorage.setItem(stateKey, 'true');
            const networkError = new Error('Failed to fetch');
            const failingImport = jest.fn().mockRejectedValue(networkError) as unknown as ComponentImport<ComponentType>;

            await expect(lazyRetry(failingImport, RETRY_KEY)).rejects.toThrow('Failed to fetch');
            await flushMicrotasks();

            expect(mockClearWorkboxRecoveryCaches).not.toHaveBeenCalled();
            expect(reloadMock).not.toHaveBeenCalled();
        });

        it('rejects to the error boundary on the third failure to prevent an infinite reload loop', async () => {
            sessionStorage.setItem(stateKey, 'cache-cleared');
            const failingImport = jest.fn().mockRejectedValue(chunkError) as unknown as ComponentImport<ComponentType>;

            await expect(lazyRetry(failingImport, RETRY_KEY)).rejects.toBeDefined();
            await flushMicrotasks();

            expect(mockClearWorkboxRecoveryCaches).not.toHaveBeenCalled();
            expect(reloadMock).not.toHaveBeenCalled();
        });

        it('keeps each import retry state isolated so a sibling success does not reset it', async () => {
            // 'other' chunk already reloaded once; a successful 'test' chunk import must not reset it.
            sessionStorage.setItem(`${CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED}:other`, 'true');
            const successfulImport = jest.fn().mockResolvedValue({default: () => null}) as unknown as ComponentImport<ComponentType>;

            await lazyRetry(successfulImport, RETRY_KEY);
            await flushMicrotasks();

            expect(sessionStorage.getItem(`${CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED}:other`)).toBe('true');
        });

        it('does not reload on successful import', async () => {
            sessionStorage.removeItem(stateKey);
            const successfulImport = jest.fn().mockResolvedValue({default: () => null}) as unknown as ComponentImport<ComponentType>;

            await lazyRetry(successfulImport, RETRY_KEY);
            await flushMicrotasks();

            expect(mockClearWorkboxRecoveryCaches).not.toHaveBeenCalled();
            expect(reloadMock).not.toHaveBeenCalled();
        });
    });
});
