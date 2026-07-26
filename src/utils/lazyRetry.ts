import clearWorkboxRecoveryCaches from '@libs/clearWorkboxRecoveryCaches';
import isChunkLoadError from '@libs/isChunkLoadError';

import CONST from '@src/CONST';

import type {ComponentType} from 'react';

type Import<T> = Promise<{default: T}>;
type ComponentImport<T> = () => Import<T>;

// Three-state retry machine stored in sessionStorage:
//   'false'        — no reload attempted yet (default)
//   'true'         — one plain reload has been attempted
//   'cache-cleared'— SW caches were cleared and a second reload was attempted
const RETRY_STATE = {
    INITIAL: 'false',
    RELOADED: 'true',
    CACHE_CLEARED: 'cache-cleared',
} as const;

/**
 * The retry state must be scoped per import. Multiple chunks are lazy-loaded in sequence
 * (e.g. AppNavigator, then AuthScreens), so a global flag could be reset to INITIAL by one
 * chunk's success while another chunk is still failing, restarting that chunk's retry cycle
 * forever instead of advancing to the cache-clearing branch.
 */
function getRetryStateKey(retryKey: string): string {
    return `${CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED}:${retryKey}`;
}

/**
 * Attempts to lazily import a React component with a graduated retry strategy.
 *
 * - First failure: plain reload — handles transient network blips without touching caches.
 * - Second failure that is a ChunkLoadError AND the device is online: clear the service worker
 *   cache and reload — handles the post-deploy stale-shell scenario where the SW is serving an
 *   old index.html that references chunk hashes no longer on the CDN.
 *   The online guard is critical: a chunk fetch that fails while offline also produces a
 *   ChunkLoadError, and clearing the service worker cache in that case would destroy the cached
 *   app shell that is the only thing keeping the PWA usable until connectivity returns.
 * - Any subsequent failure, a second failure that is not a ChunkLoadError, or a second failure
 *   while offline: propagate to the React error boundary so the user sees the error page.
 *
 * @param componentImport - A function that returns a promise resolving to a lazily imported React component.
 * @param retryKey - A stable identifier unique to this import, used to scope the retry state so
 *                    sibling imports do not interfere with each other's recovery cycle.
 * @returns A promise that resolves to the imported component or rejects after all recovery attempts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ComponentType requires any for the generic constraint to accept all component shapes
const lazyRetry = function <T extends ComponentType<any>>(componentImport: ComponentImport<T>, retryKey: string): Import<T> {
    return new Promise((resolve, reject) => {
        const stateKey = getRetryStateKey(retryKey);
        const retryState = sessionStorage.getItem(stateKey) ?? RETRY_STATE.INITIAL;

        componentImport()
            .then((component) => {
                sessionStorage.setItem(stateKey, RETRY_STATE.INITIAL);
                resolve(component);
            })
            .catch((error: unknown) => {
                if (retryState === RETRY_STATE.INITIAL) {
                    // First failure: plain reload to handle transient errors cheaply.
                    console.error('Failed to lazily import a React component, refreshing the page in order to retry the operation.', error);
                    sessionStorage.setItem(stateKey, RETRY_STATE.RELOADED);
                    window.location.reload();
                } else if (retryState === RETRY_STATE.RELOADED && isChunkLoadError(error) && navigator.onLine) {
                    // Second failure, it is a ChunkLoadError, and the device is online: the plain
                    // reload did not fix it — likely the SW is serving a stale shell after a deploy.
                    // Clear the service worker cache and reload. Keep the flag at CACHE_CLEARED so
                    // a third failure surfaces the error boundary instead of starting over.
                    console.error('Failed to lazily import a React component after reload, clearing SW caches and reloading.', error);
                    sessionStorage.setItem(stateKey, RETRY_STATE.CACHE_CLEARED);
                    clearWorkboxRecoveryCaches().then(() => window.location.reload());
                } else {
                    // All recovery options exhausted, the device is offline, or the second failure is
                    // not a ChunkLoadError: propagate to the error boundary. The flag is left at its
                    // current advanced state (not reset), so a later failure of this same import does
                    // not restart the full reload cycle — it either fails fast (already cache-cleared)
                    // or retries the cache clear once the device is back online. A successful import
                    // resets the flag to INITIAL.
                    console.error('Failed to lazily import a React component after all recovery attempts.', error);
                    reject(error instanceof Error ? error : new Error(String(error)));
                }
            });
    });
};

export default lazyRetry;
