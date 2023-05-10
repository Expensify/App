/**
 * Wrapper to make any promise cancellable
 * from https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
 *
 * @param {Promise} promise
 * @returns {Object} {{cancel(): void, promise: Promise}}
 */
export default function makeCancellablePromise(promise) {
    let hasCancelled = false;

    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(val => (hasCancelled ? undefined : resolve(val)));
        promise.catch(error => (hasCancelled ? undefined : reject(error)));
    });

    return {
        promise: wrappedPromise,
        cancel() {
            hasCancelled = true;
        },
    };
}
