const ENVIRONMENT = require('../src/CONST/ENVIRONMENT');

/**
 * @returns {'development'|'staging'|'production'}
 */
function getEnvironment() {
    return process.env.NODE_ENV || ENVIRONMENT.DEV;
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
