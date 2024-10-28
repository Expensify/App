// eslint-disable-next-line lodash/import-scope
import type {DebouncedFunc} from 'lodash';

/**
 * Simulates a while loop where the condition is determined by the result of a Promise.
 */
function promiseWhile(condition: () => boolean, action: (() => Promise<void>) | DebouncedFunc<() => Promise<void>> | undefined): Promise<void> {
    return new Promise((resolve, reject) => {
        const loop = function () {
            if (!condition()) {
                resolve();
            } else {
                const actionResult = action?.();

                if (!actionResult) {
                    resolve();
                    return;
                }

                Promise.resolve(actionResult)
                    .then(() => {
                        // Set a timeout to delay the next loop iteration
                        setTimeout(loop, 1000); // 1000 ms delay
                    })
                    .catch(reject);
            }
        };
        loop();
    });
}

/**
 * Simulates a do-while loop where the condition is determined by the result of a Promise.
 */
function promiseDoWhile(condition: () => boolean, action: (() => Promise<void>) | DebouncedFunc<() => Promise<void>> | undefined): Promise<void> {
    return new Promise((resolve, reject) => {
        const actionResult = action?.();

        if (!actionResult) {
            resolve();
            return;
        }

        actionResult
            .then(() => promiseWhile(condition, action))
            .then(resolve)
            .catch(reject);
    });
}

export {promiseWhile, promiseDoWhile};
