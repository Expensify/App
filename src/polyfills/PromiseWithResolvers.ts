/**
 * This is a polyfill for Promise.withResolvers https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers.
 * It is not supported in Hermes as of 2025-08-26: https://github.com/facebook/hermes/pull/1452
 * It is widely supported in all major browsers.
 */
declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface PromiseConstructor {
        withResolvers<T>(): {
            promise: Promise<T>;
            resolve: (value: T | PromiseLike<T>) => void;
            reject: (reason?: unknown) => void;
        };
    }
}

if (typeof (Promise as typeof Promise & {withResolvers?: unknown}).withResolvers !== 'function') {
    Object.defineProperty(Promise, 'withResolvers', {
        value<T>() {
            let resolve!: (value: T | PromiseLike<T>) => void;
            let reject!: (reason?: unknown) => void;
            const promise = new Promise<T>((res, rej) => {
                resolve = res;
                reject = rej;
            });
            return {promise, resolve, reject};
        },
        configurable: true,
        writable: true,
    });
}
