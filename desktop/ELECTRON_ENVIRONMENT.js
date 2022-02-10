// This variable is injected into package.json by electron-builder via the extraMetadata field (specified in electron.config.js)
// It will be `PROD` on production, `STG` on staging, and `undefined` on dev (because dev doesn't use electron-builder)
const {electronEnvironment} = require('../package.json');
const ENVIRONMENT = require('../src/CONST/ENVIRONMENT');

/**
 * @returns {String} – One of ['PROD', 'STG', 'DEV']
 */
function getEnvironment() {
    // If we are on dev, then the NODE_ENV environment variable will be present (set by the executing shell in start.js)
    if (process.env.NODE_ENV === 'development') {
        return ENVIRONMENT.DEV;
    }

    // Otherwise, use the environment injected into package.json by electron-builder
    return electronEnvironment;
}

function isDev() {
    return getEnvironment() === ENVIRONMENT.DEV;
}

function isProd() {
    return getEnvironment() === ENVIRONMENT.PRODUCTION;
}

module.exports = {
    isDev,
    isProd,
};
