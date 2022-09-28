const {INTERACTION_TIMEOUT} = require('../config');

const TIMEOUT = process.env.INTERACTION_TIMEOUT || INTERACTION_TIMEOUT;

const withFailTimeout = (promise, name) => {
    const timeoutId = setTimeout(() => {
        throw new Error(`[${name}] Interaction timed out after ${(TIMEOUT / 1000).toFixed(0)}s`);
    }, Number(TIMEOUT));
    return promise.finally(() => clearTimeout(timeoutId));
};

module.exports = withFailTimeout;
