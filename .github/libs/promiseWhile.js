/**
 * Simulates a while loop where the condition is determined by the result of a Promise.
 *
 * @param {Function} condition
 * @param {Function} action
 * @returns {Promise}
 */
function promiseWhile(condition, action) {
    console.info('[promiseWhile] promiseWhile()');

    return new Promise((resolve, reject) => {
        const loop = function () {
            if (!condition()) {
                resolve();
            } else {
                const actionResult = action();
                console.info('[promiseWhile] promiseWhile() actionResult', actionResult);
                Promise.resolve(actionResult).then(loop).catch(reject);
            }
        };
        loop();
    });
}

/**
 * Simulates a do-while loop where the condition is determined by the result of a Promise.
 *
 * @param {Function} condition
 * @param {Function} action
 * @returns {Promise}
 */
function promiseDoWhile(condition, action) {
    console.info('[promiseWhile] promiseDoWhile()');

    return new Promise((resolve, reject) => {
        console.info('[promiseWhile] promiseDoWhile() condition', condition);
        const actionResult = action();
        console.info('[promiseWhile] promiseDoWhile() actionResult', actionResult);
        actionResult
            .then(() => promiseWhile(condition, action))
            .then(() => resolve())
            .catch(reject);
    });
}

module.exports = {
    promiseWhile,
    promiseDoWhile,
};
