/**
 * Native devices don't support Promise.allSettled, but all modern browsers do so a reference directly to the native
 * Promise implementation is fine.
 */

/**
 * Returns a promise that is resolved when all provided promises are either resolved or rejected
 *
 * @param {Promise[]} arrayOfPromises
 * @returns {Promise}
 */
const promiseAllSettled = arrayOfPromises => Promise.allSettled(arrayOfPromises);

export default promiseAllSettled;
