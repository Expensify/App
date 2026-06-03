import type {ComponentType} from 'react';
import clearWorkboxRecoveryCaches from '@libs/clearWorkboxRecoveryCaches';
import CONST from '@src/CONST';

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

function isChunkLoadError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }
    return error.name === CONST.CHUNK_LOAD_ERROR || /Loading chunk \S+ failed/i.test(error.message);
}

/**
 * Attempts to lazily import a React component with a graduated retry strategy.
 *
 * - First failure: plain reload — handles transient network blips without touching caches.
 * - Second failure that is a ChunkLoadError: clear the SW precache and reload — handles the
 *   post-deploy stale-shell scenario where the SW pinned an old index.html that references
 *   chunk hashes no longer on the CDN. Caches are left intact for non-ChunkLoadErrors (e.g.
 *   offline) so the offline-capable precache is not destroyed for a recoverable situation.
 * - Any subsequent failure (or a second failure that is not a ChunkLoadError): propagate the
 *   error to the React error boundary so the user sees the error page instead of looping.
 *
 * @param componentImport - A function that returns a promise resolving to a lazily imported React component.
 * @returns A promise that resolves to the imported component or rejects after all recovery attempts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ComponentType requires any for the generic constraint to accept all component shapes
const lazyRetry = function <T extends ComponentType<any>>(componentImport: ComponentImport<T>): Import<T> {
    return new Promise((resolve, reject) => {
        const retryState = sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED) ?? RETRY_STATE.INITIAL;

        componentImport()
            .then((component) => {
                sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED, RETRY_STATE.INITIAL);
                resolve(component);
            })
            .catch((error: unknown) => {
                if (retryState === RETRY_STATE.INITIAL) {
                    // First failure: plain reload to handle transient errors cheaply.
                    console.error('Failed to lazily import a React component, refreshing the page in order to retry the operation.', error);
                    sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED, RETRY_STATE.RELOADED);
                    window.location.reload();
                } else if (retryState === RETRY_STATE.RELOADED && isChunkLoadError(error)) {
                    // Second failure and it is a ChunkLoadError: the plain reload did not help —
                    // likely a stale SW precache. Clear caches and reload. Keep the flag at
                    // CACHE_CLEARED so that a third failure will surface the error boundary
                    // rather than starting the cycle over.
                    console.error('Failed to lazily import a React component after reload, clearing SW caches and reloading.', error);
                    sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED, RETRY_STATE.CACHE_CLEARED);
                    clearWorkboxRecoveryCaches().then(() => window.location.reload());
                } else {
                    // All recovery options exhausted, or second failure is not a ChunkLoadError
                    // (e.g. offline): propagate to the error boundary and reset the flag so the
                    // retry cycle is available again next time the user navigates.
                    console.error('Failed to lazily import a React component after all recovery attempts.', error);
                    sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED, RETRY_STATE.INITIAL);
                    reject(error instanceof Error ? error : new Error(String(error)));
                }
            });
    });
};

export default lazyRetry;
