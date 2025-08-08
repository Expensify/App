/**
 * Create a deferred promise with exposed resolve and reject methods.
 */
function createDeferredPromise<T = unknown>() {
    const deferred = {} as {
        promise: Promise<T>;
        resolve: (value: T) => void;
        reject: (reason?: unknown) => void;
    };

    deferred.promise = new Promise<T>((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });

    return deferred;
}

export default createDeferredPromise;
