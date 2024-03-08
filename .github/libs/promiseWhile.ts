/**
 * Simulates a while loop where the condition is determined by the result of a Promise.
 */
function promiseWhile(condition: () => boolean, action: () => Promise<void>) {
    return new Promise<void>((resolve, reject) => {
        const loop = function () {
            if (!condition()) {
                resolve();
            } else {
                Promise.resolve(action()).then(loop).catch(reject);
            }
        };
        loop();
    });
}

/**
 * Simulates a do-while loop where the condition is determined by the result of a Promise.
 */
function promiseDoWhile(condition: () => boolean, action: () => Promise<void>) {
    return new Promise<void>((resolve, reject) => {
        action()
            .then(() => promiseWhile(condition, action))
            .then(() => resolve())
            .catch(reject);
    });
}

export default {
    promiseWhile,
    promiseDoWhile,
};
