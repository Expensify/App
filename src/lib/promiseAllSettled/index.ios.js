/**
 * This file implements the idea of Promise.allSettled which isn't supported on IOS. Read more about it here:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
 */
import _ from 'underscore';

/**
 * Returns a promise that is resolved when all provided promises are either resolved or rejected
 *
 * @param {Promise[]} arrayOfPromises
 * @returns {Promise}
 */
const promiseAllSettled = (arrayOfPromises) => {
    const mainPromise = new Promise((resolve) => {
        const done = _.after(arrayOfPromises.length, resolve);
        _.each(arrayOfPromises, (promise) => {
            promise.then(done).catch(done);
        });
    });
    return mainPromise;
};

export default promiseAllSettled;
