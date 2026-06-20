/**
 * YAPLJS bridge timeout handler
 *
 * Prevents the main thread from blocking for more than 2000ms during YAPLJS callFunction operations.
 * This is a workaround for JSC lock contention deadlocks on iOS HybridApp where nested JS calls
 * can cause the main thread to wait indefinitely for the JSC lock.
 *
 * Issue: https://github.com/Expensify/App/issues/93847
 * Related: https://github.com/Expensify/App/issues/91229
 */

const YAPLJS_CALL_TIMEOUT = 2000; // milliseconds

/**
 * Wrapper for YAPLJS callFunction to prevent main-thread blocking
 * When a JS call to native code triggers logging (or other operations that re-enter JS),
 * this timeout ensures the main thread is not blocked indefinitely.
 */
function createTimeoutWrapper(originalCallFunction) {
    return function callFunctionWithTimeout(functionName, args) {
        return new Promise((resolve, reject) => {
            let completed = false;

            // Set up a timeout that will reject if the call takes too long
            const timeoutId = setTimeout(() => {
                if (!completed) {
                    completed = true;
                    const timeoutError = new Error(
                        `YAPLJS.callFunction('${functionName}') exceeded timeout of ${YAPLJS_CALL_TIMEOUT}ms. ` +
                        'This usually indicates a deadlock in the JS-to-native bridge (likely JSC lock contention). ' +
                        'The operation may have completed or may still be running.'
                    );
                    timeoutError.name = 'YAPLJSTimeoutError';
                    timeoutError.code = 'YAPLJS_TIMEOUT';
                    reject(timeoutError);
                }
            }, YAPLJS_CALL_TIMEOUT);

            // Execute the original call function
            const originalPromise = originalCallFunction.call(this, functionName, args);

            // Handle the result
            Promise.resolve(originalPromise)
                .then((result) => {
                    if (!completed) {
                        completed = true;
                        clearTimeout(timeoutId);
                        resolve(result);
                    }
                })
                .catch((error) => {
                    if (!completed) {
                        completed = true;
                        clearTimeout(timeoutId);
                        reject(error);
                    }
                });
        });
    };
}

export {createTimeoutWrapper, YAPLJS_CALL_TIMEOUT};
