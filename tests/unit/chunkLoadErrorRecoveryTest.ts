/**
 * Regression tests for the Safari PWA ChunkLoadError crash loop.
 *
 * Before the fix, both recovery paths used a bare window.location.reload().
 * In Safari PWA standalone mode this re-serves the stale service-worker precache
 * (and an HTTP-cached index.html), reproducing the identical ChunkLoadError on every
 * refresh. The fix routes each reload through clearWorkboxRecoveryCaches() (unregisters
 * the SW and clears Cache Storage) and then reloadWithCacheBust() (navigates to a unique
 * URL so the HTTP/edge cache is bypassed), so the next load fetches a fresh,
 * internally-consistent shell from the CDN.
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: (...args: unknown[]): any => mockClearWorkboxRecoveryCaches(...args),
}));

const mockReloadWithCacheBust = jest.fn();
jest.mock('@libs/reloadWithCacheBust', () => ({
    __esModule: true,
    default: () => mockReloadWithCacheBust() as unknown,
}));

// jest-expo resolves @hooks/usePageRefresh to the .native.ts variant (which does not use
// clearWorkboxRecoveryCaches). Override the alias to load the web file so this test covers
// the web-specific reload path that was changed. The web file's own imports (including
// clearWorkboxRecoveryCaches) still go through the normal mock registry.
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
    // Records the order in which clear and reload are called within each test.
    const callOrder: string[] = [];

    beforeEach(() => {
        callOrder.length = 0;
        mockClearWorkboxRecoveryCaches.mockImplementation(() => {
            callOrder.push('clear');
            return Promise.resolve();
        });
        mockReloadWithCacheBust.mockImplementation(() => {
            callOrder.push('reload');
        });
        mockReloadWithCacheBust.mockClear();
        mockClearWorkboxRecoveryCaches.mockClear();
        sessionStorage.clear();
    });

    describe('usePageRefresh (web)', () => {
        it('clears caches before the cache-busting reload when isChunkLoadError is true', async () => {
            const {result} = renderHook(() => usePageRefresh());

            result.current(true);
            await flushMicrotasks();

            expect(mockClearWorkboxRecoveryCaches).toHaveBeenCalledTimes(1);
            expect(mockReloadWithCacheBust).toHaveBeenCalledTimes(1);
            expect(callOrder).toEqual(['clear', 'reload']);
        });

        it('does not reload at all when isChunkLoadError is false and no prior refresh', async () => {
            const {result} = renderHook(() => usePageRefresh());

            result.current(false);
            await flushMicrotasks();

            expect(mockClearWorkboxRecoveryCaches).not.toHaveBeenCalled();
            expect(mockReloadWithCacheBust).not.toHaveBeenCalled();
        });
    });

    describe('lazyRetry', () => {
        it('clears caches before the cache-busting reload on the first chunk load failure', async () => {
            sessionStorage.removeItem(CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED);
            const failingImport = jest.fn().mockRejectedValue(new Error('chunk failed')) as unknown as ComponentImport<ComponentType>;

            lazyRetry(failingImport);
            await flushMicrotasks();

            expect(mockClearWorkboxRecoveryCaches).toHaveBeenCalledTimes(1);
            expect(mockReloadWithCacheBust).toHaveBeenCalledTimes(1);
            expect(callOrder).toEqual(['clear', 'reload']);
        });

        it('does not reload on successful import', async () => {
            sessionStorage.removeItem(CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED);
            const successfulImport = jest.fn().mockResolvedValue({default: () => null}) as unknown as ComponentImport<ComponentType>;

            await lazyRetry(successfulImport);
            await flushMicrotasks();

            expect(mockClearWorkboxRecoveryCaches).not.toHaveBeenCalled();
            expect(mockReloadWithCacheBust).not.toHaveBeenCalled();
        });
    });
});
