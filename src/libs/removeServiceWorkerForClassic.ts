import Log from './Log';
import unregisterServiceWorkers from './unregisterServiceWorkers';
import {blockAndClearUserMedia} from './UserMediaCache';

const REMOVAL_TIMEOUT_MS = 2000;

async function removeWorkerAndMedia(): Promise<void> {
    try {
        await blockAndClearUserMedia();
    } catch (error) {
        Log.warn('[SW] Failed to clear saved media before opening Expensify Classic', {error});
    }

    try {
        await unregisterServiceWorkers();
    } catch (error) {
        Log.warn('[SW] Failed to unregister the service worker before opening Expensify Classic', {error});
    }
}

/**
 * On the host that serves both products, Expensify Classic must work as if New Expensify's service worker didn't exist. Tabs the worker
 * already controls keep it after it is unregistered, so saving media is blocked as well. The precached app stays, so returning is fast.
 * Failures are logged and never stop Classic from opening, and neither does a browser API that never settles, because the wait is bounded.
 */
async function removeServiceWorkerForClassic(): Promise<void> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<void>((resolve) => {
        timer = setTimeout(() => {
            Log.warn('[SW] Timed out removing the service worker before opening Expensify Classic');
            resolve();
        }, REMOVAL_TIMEOUT_MS);
    });
    try {
        await Promise.race([removeWorkerAndMedia(), timeout]);
    } finally {
        clearTimeout(timer);
    }
}

export default removeServiceWorkerForClassic;
