import waitForBatchedUpdates from './waitForBatchedUpdates';

/**
 * Method flushes microtasks and pending timers twice. Because we batch onyx updates
 * Network requests takes 2 microtask cycles to resolve
 * **Note:** It is recommended to wait for the Onyx operations, so in your tests its preferred to do:
 *  ✅  Onyx.merge(...).then(...)
 *  than to do
 *  ❌  Onyx.merge(...)
 *      waitForBatchedUpdates().then(...)
 */
const waitForNetworkPromises = (): Promise<void> => waitForBatchedUpdates().then(waitForBatchedUpdates);

export default waitForNetworkPromises;
