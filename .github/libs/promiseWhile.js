/**
 * Simulates a while loop where the condition is determined by the result of a Promise.
 *
 * @param {Function} condition
 * @param {Function} action
 * @returns {Promise}
 */
function promiseWhile(condition, action) {
    return new Promise((resolve, reject) => {
        const loop = function () {
            if (!condition()) {
                resolve();
            } else {
                Promise.resolve(action())
                    .then(loop)
                    .catch(reject);
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
    return new Promise((resolve, reject) => {
        action()
            .then(() => promiseWhile(condition, action))
            .then(() => resolve())
            .catch(reject);
    });
}

module.exports = {
    promiseWhile,
    promiseDoWhile,
};
