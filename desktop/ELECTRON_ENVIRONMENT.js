// This variable is injected into package.json by electron-builder via the extraMetadata field (specified in electronBuilder.ghactions.config.js)
// It will be `PROD` on production, `STG` on staging, and `undefined` on dev (because dev doesn't use electron-builder)
const {electronEnvironment} = require('../package.json');
const ENVIRONMENT = require('../src/CONST/ENVIRONMENT');

/**
 * @returns {String} – One of ['PROD', 'STG', 'DEV']
 */
function getEnvironment() {
    // If we are on dev, then the ELECTRON_ENVIRONMENT environment variable will be present (set in package.json desktop script `npm run desktop`)
    if (process.env.ELECTRON_ENV === ENVIRONMENT.DEV) {
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
