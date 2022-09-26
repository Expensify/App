const {INTERACTION_TIMEOUT} = require('../config');

const withFailTimeout = (promise, name) => {
    const timeoutId = setTimeout(() => {
        throw new Error(`[${name}] Interaction timed out`);
    }, INTERACTION_TIMEOUT);
    return promise.finally(() => clearTimeout(timeoutId));
};

module.exports = withFailTimeout;
