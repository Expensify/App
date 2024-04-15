import type {DebouncedFunc} from 'lodash';

/**
 * Simulates a while loop where the condition is determined by the result of a Promise.
 */
function promiseWhile(condition: () => boolean, action: (() => Promise<void>) | DebouncedFunc<() => Promise<void>> | undefined): Promise<void> {
    console.info('[promiseWhile] promiseWhile()');

    return new Promise((resolve, reject) => {
        const loop = function () {
            if (!condition()) {
                resolve();
            } else {
                const actionResult = action?.();
                console.info('[promiseWhile] promiseWhile() actionResult', actionResult);

                if (!actionResult) {
                    resolve();
                    return;
                }

                Promise.resolve(actionResult).then(loop).catch(reject);
            }
        };
        loop();
    });
}

/**
 * Simulates a do-while loop where the condition is determined by the result of a Promise.
 */
function promiseDoWhile(condition: () => boolean, action: (() => Promise<void>) | DebouncedFunc<() => Promise<void>> | undefined): Promise<void> {
    console.info('[promiseWhile] promiseDoWhile()');

    return new Promise((resolve, reject) => {
        console.info('[promiseWhile] promiseDoWhile() condition', condition);
        const actionResult = action?.();
        console.info('[promiseWhile] promiseDoWhile() actionResult', actionResult);
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
