import type {ComponentType} from 'react';
import clearWorkboxRecoveryCaches from '@libs/clearWorkboxRecoveryCaches';
import CONST from '@src/CONST';

type Import<T> = Promise<{default: T}>;
type ComponentImport<T> = () => Import<T>;

/**
 * Attempts to lazily import a React component with a retry mechanism on failure.
 *
 * On the first failure a plain reload is attempted — this handles transient network
 * blips cheaply without touching the service-worker caches.
 *
 * If the chunk still fails after that reload, the service-worker precache and Cache
 * Storage are cleared before a second reload. This handles the post-deploy stale-shell
 * scenario where the SW has pinned an old index.html that references chunk hashes which
 * no longer exist on the CDN.
 *
 * @param componentImport - A function that returns a promise resolving to a lazily imported React component.
 * @returns A promise that resolves to the imported component. If all attempts fail the page is reloaded and the promise never settles.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lazyRetry = function <T extends ComponentType<any>>(componentImport: ComponentImport<T>): Import<T> {
    return new Promise((resolve) => {
        // Retrieve the retry status from sessionStorage, defaulting to 'false' if not set
        const hasRefreshed = JSON.parse(sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED) ?? 'false') as boolean;

        componentImport()
            .then((component) => {
                // Reset the retry status to 'false' on successful import
                sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED, 'false'); // success so reset the refresh
                resolve(component);
            })
            .catch((component: ComponentImport<T>) => {
                if (!hasRefreshed) {
                    // First failure: plain reload to handle transient network errors cheaply.
                    console.error('Failed to lazily import a React component, refreshing the page in order to retry the operation.', component);
                    sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED, 'true');
                    window.location.reload();
                } else {
                    // Second failure: the plain reload did not fix it — likely a stale
                    // service-worker precache after a deploy. Clear SW caches before reloading
                    // so the next load fetches a fresh, internally-consistent shell from the CDN.
                    console.error('Failed to lazily import a React component after the retry operation, clearing SW caches and reloading.', component);
                    sessionStorage.removeItem(CONST.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED);
                    clearWorkboxRecoveryCaches().then(() => window.location.reload());
                }
            });
    });
};

export default lazyRetry;
