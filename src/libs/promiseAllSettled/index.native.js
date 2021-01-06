/**
 * This file implements the idea of Promise.allSettled which isn't supported on native devices. Read more about it here:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
 *
 * Returns a promise that is resolved when all provided promises are either resolved or rejected
 *
 * @source: https://stackoverflow.com/a/39031032/1858217
 *
 * @param {Promise[]} arrayOfPromises
 * @returns {Promise}
 */
const promiseAllSettled = (arrayOfPromises) => {
    const wrappedPromises = arrayOfPromises.map(p => Promise.resolve(p)
        .then(
            val => ({status: 'fulfilled', value: val}),
            err => ({status: 'rejected', reason: err}),
        ));
    return Promise.all(wrappedPromises);
};

export default promiseAllSettled;
