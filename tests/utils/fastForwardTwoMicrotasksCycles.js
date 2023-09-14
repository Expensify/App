import waitForPromisesToResolve from './waitForPromisesToResolve';

/**
 * Method flushes microtasks and pending timers twice. Because we batch onyx updates
 * Some operations like for instance network requests takes 2 microtask cycles to resolve
 * **Note:** It is recommended to wait for the Onyx operations, so in your tests its preferred to do:
 *  ✅  Onyx.merge(...).then(...)
 *  than to do
 *  ❌  Onyx.merge(...)
 *      waitForPromisesToResolve().then(...)
 *
 * @returns {Promise}
 */
export default () => waitForPromisesToResolve().then(waitForPromisesToResolve);
