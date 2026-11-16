import Log from './Log';
import unregisterServiceWorkers from './unregisterServiceWorkers';
import {blockAndClearUserMedia} from './UserMediaCache';

/**
 * On the host that serves both products, Expensify Classic must work as if New Expensify's service worker didn't exist. Tabs the worker
 * already controls keep it after it is unregistered, so saving media is blocked as well. The precached app stays, so returning is fast.
 * Failures are logged and never stop Classic from opening.
 */
async function removeServiceWorkerForClassic(): Promise<void> {
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

export default removeServiceWorkerForClassic;
