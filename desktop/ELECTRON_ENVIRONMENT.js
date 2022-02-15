const ENVIRONMENT = require('../src/CONST/ENVIRONMENT');

/**
 * @returns {'development'|'staging'|'production'}
 */
function getEnvironment() {
    return process.env.ELECTRON_ENV;
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
