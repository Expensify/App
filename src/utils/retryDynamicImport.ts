import clearWorkboxRecoveryCaches from '@libs/clearWorkboxRecoveryCaches';
import isChunkLoadError from '@libs/isChunkLoadError';

import CONST from '@src/CONST';

// Three-state retry machine stored in sessionStorage:
//   'false'        — no reload attempted yet (default)
//   'true'         — one plain reload has been attempted
//   'cache-cleared'— SW caches were cleared and a second reload was attempted
const RETRY_STATE = {
    INITIAL: 'false',
    RELOADED: 'true',
    CACHE_CLEARED: 'cache-cleared',
} as const;

type RetryState = (typeof RETRY_STATE)[keyof typeof RETRY_STATE];

/**
 * The retry state is scoped per import: a global flag could be reset by one chunk's success
 * while another chunk is still failing, restarting that chunk's retry cycle forever.
 */
function getRetryStateKey(retryKey: string): string {
    return `${CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED}:${retryKey}`;
}

/**
 * Returns null when sessionStorage is unusable. Attempts then cannot be counted, so callers
 * must reject instead of reloading — otherwise every attempt reads the same state and the
 * page reloads forever.
 */
function readRetryState(stateKey: string): RetryState | null {
    if (typeof sessionStorage === 'undefined') {
        return null;
    }

    try {
        const storedState = sessionStorage.getItem(stateKey);
        if (storedState === RETRY_STATE.RELOADED || storedState === RETRY_STATE.CACHE_CLEARED) {
            return storedState;
        }
        return RETRY_STATE.INITIAL;
    } catch {
        return null;
    }
}

/** Returns false if the write did not stick, in which case the caller must not reload (see readRetryState). */
function writeRetryState(stateKey: string, state: RetryState): boolean {
    if (typeof sessionStorage === 'undefined') {
        return false;
    }

    try {
        sessionStorage.setItem(stateKey, state);
        return true;
    } catch {
        return false;
    }
}

/**
 * Attempts a dynamic import with a graduated recovery strategy:
 *
 * - First failure: plain reload — handles transient network blips without touching caches.
 * - Second failure that is a ChunkLoadError AND the device is online: clear the service worker
 *   cache and reload — handles the post-deploy stale-shell scenario where the SW is serving an
 *   old index.html that references chunk hashes no longer on the CDN. The online guard prevents
 *   destroying the cached app shell that keeps the PWA usable while offline.
 * - Anything else (recovery exhausted, offline, non-chunk error, unusable sessionStorage):
 *   reject so the caller can surface the failure.
 *
 * On the reload branches the returned promise never settles, because the page is being replaced.
 *
 * @param moduleImport - A function that returns the promise of a dynamically imported module.
 * @param retryKey - A stable identifier unique to this import, used to scope the retry state.
 */
function retryDynamicImport<T>(moduleImport: () => Promise<T>, retryKey: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const stateKey = getRetryStateKey(retryKey);
        const retryState = readRetryState(stateKey);

        const rejectWith = (error: unknown) => reject(error instanceof Error ? error : new Error(String(error)));

        moduleImport()
            .then((module) => {
                writeRetryState(stateKey, RETRY_STATE.INITIAL);
                resolve(module);
            })
            .catch((error: unknown) => {
                if (retryState === null) {
                    console.error('Failed to import a module and sessionStorage is unavailable, so it cannot be retried safely.', error);
                    rejectWith(error);
                    return;
                }

                if (retryState === RETRY_STATE.INITIAL) {
                    console.error('Failed to import a module, refreshing the page in order to retry the operation.', error);
                    if (!writeRetryState(stateKey, RETRY_STATE.RELOADED)) {
                        rejectWith(error);
                        return;
                    }
                    window.location.reload();
                } else if (retryState === RETRY_STATE.RELOADED && isChunkLoadError(error) && navigator.onLine) {
                    console.error('Failed to import a module after reload, clearing SW caches and reloading.', error);
                    if (!writeRetryState(stateKey, RETRY_STATE.CACHE_CLEARED)) {
                        rejectWith(error);
                        return;
                    }
                    clearWorkboxRecoveryCaches().then(() => window.location.reload());
                } else {
                    // The flag is intentionally left at its advanced state so a later failure of this
                    // same import fails fast instead of restarting the reload cycle. A successful
                    // import resets it to INITIAL.
                    console.error('Failed to import a module after all recovery attempts.', error);
                    rejectWith(error);
                }
            });
    });
}

export default retryDynamicImport;
