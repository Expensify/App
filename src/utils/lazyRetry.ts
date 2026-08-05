import clearWorkboxRecoveryCaches from '@libs/clearWorkboxRecoveryCaches';
import isChunkLoadError from '@libs/isChunkLoadError';
import {getIsOffline, onReachabilityConfirmed} from '@libs/NetworkState';

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
 * The offline path deliberately consumes no retry state: a blip must not burn the reload attempt,
 * and must not clear the service worker cache that is the only thing keeping the PWA usable until
 * connectivity returns. Clearing it while online instead recovers a post-deploy stale shell, where
 * the SW serves an index.html referencing chunk hashes no longer on the CDN.
 *
 * @param retryKey - Stable identifier unique to this import, so sibling imports do not interfere
 *                   with each other's recovery cycle.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ComponentType requires any for the generic constraint to accept all component shapes
const lazyRetry = function <T extends ComponentType<any>>(componentImport: ComponentImport<T>, retryKey: string): Import<T> {
    return new Promise((resolve, reject) => {
        const stateKey = getRetryStateKey(retryKey);

        const attemptImport = () => {
            componentImport()
                .then((component) => {
                    sessionStorage.setItem(stateKey, RETRY_STATE.INITIAL);
                    resolve(component);
                })
                .catch((error: unknown) => {
                    if (getIsOffline()) {
                        console.error('Failed to lazily import a React component while offline, waiting for the internet to come back.', error);
                        const unsubscribe = onReachabilityConfirmed(() => {
                            unsubscribe();
                            attemptImport();
                        });
                        return;
                    }

                    const retryState = sessionStorage.getItem(stateKey) ?? RETRY_STATE.INITIAL;

                    if (retryState === RETRY_STATE.INITIAL) {
                        console.error('Failed to lazily import a React component, refreshing the page in order to retry the operation.', error);
                        sessionStorage.setItem(stateKey, RETRY_STATE.RELOADED);
                        window.location.reload();
                    } else if (retryState === RETRY_STATE.RELOADED && isChunkLoadError(error)) {
                        console.error('Failed to lazily import a React component after reload, clearing SW caches and reloading.', error);
                        sessionStorage.setItem(stateKey, RETRY_STATE.CACHE_CLEARED);
                        clearWorkboxRecoveryCaches().then(() => window.location.reload());
                    } else {
                        console.error('Failed to lazily import a React component after all recovery attempts.', error);
                        reject(error instanceof Error ? error : new Error(String(error)));
                    }
                });
        };

        attemptImport();
    });
};

export default lazyRetry;
