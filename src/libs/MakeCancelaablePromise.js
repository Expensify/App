/**
 * Wrapper to make any promise cancellable
 * from https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
 *
 * @param {Promise} promise
 * @returns {Object} {{cancel(): void, promise: Promise}}
 */
export default function makeCancelablePromise(promise) {
    let hasCanceled_ = false;

    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then((val) => hasCanceled_ ? reject({isCanceled: true}) : resolve(val));
        promise.catch((error) => hasCanceled_ ? reject({isCanceled: true}) : reject(error));
    });

    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled_ = true;
        },
    };
};
