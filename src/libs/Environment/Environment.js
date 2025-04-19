
let _a; let _b;
exports.__esModule = true;
exports.getOldDotURLFromEnvironment =
    exports.getOldDotEnvironmentURL =
    exports.getEnvironmentURL =
    exports.isProduction =
    exports.isDevelopment =
    exports.isInternalTestBuild =
    exports.getEnvironment =
        void 0;
const react_native_config_1 = require('react-native-config');
const CONFIG_1 = require('@src/CONFIG');
const CONST_1 = require('@src/CONST');
const getEnvironment_1 = require('./getEnvironment');

exports.getEnvironment = getEnvironment_1['default'];
const ENVIRONMENT_URLS =
    ((_a = {}),
    (_a[CONST_1['default'].ENVIRONMENT.DEV] = CONST_1['default'].DEV_NEW_EXPENSIFY_URL + CONFIG_1['default'].DEV_PORT),
    (_a[CONST_1['default'].ENVIRONMENT.STAGING] = CONST_1['default'].STAGING_NEW_EXPENSIFY_URL),
    (_a[CONST_1['default'].ENVIRONMENT.PRODUCTION] = CONST_1['default'].NEW_EXPENSIFY_URL),
    (_a[CONST_1['default'].ENVIRONMENT.ADHOC] = CONST_1['default'].STAGING_NEW_EXPENSIFY_URL),
    _a);
const OLDDOT_ENVIRONMENT_URLS =
    ((_b = {}),
    (_b[CONST_1['default'].ENVIRONMENT.DEV] = CONST_1['default'].INTERNAL_DEV_EXPENSIFY_URL),
    (_b[CONST_1['default'].ENVIRONMENT.STAGING] = CONST_1['default'].STAGING_EXPENSIFY_URL),
    (_b[CONST_1['default'].ENVIRONMENT.PRODUCTION] = CONST_1['default'].EXPENSIFY_URL),
    (_b[CONST_1['default'].ENVIRONMENT.ADHOC] = CONST_1['default'].STAGING_EXPENSIFY_URL),
    _b);
/**
 * Are we running the app in development?
 */
function isDevelopment() {
    let _a;
    return (
        ((_a = react_native_config_1['default'] === null || react_native_config_1['default'] === void 0 ? void 0 : react_native_config_1['default'].ENVIRONMENT) !== null && _a !== void 0
            ? _a
            : CONST_1['default'].ENVIRONMENT.DEV) === CONST_1['default'].ENVIRONMENT.DEV
    );
}
exports.isDevelopment = isDevelopment;
/**
 * Are we running the app in production?
 */
function isProduction() {
    return getEnvironment_1['default']().then(function (environment) {
        return environment === CONST_1['default'].ENVIRONMENT.PRODUCTION;
    });
}
exports.isProduction = isProduction;
/**
 * Are we running an internal test build?
 */
function isInternalTestBuild() {
    let _a; let _b;
    return !!(
        ((_a = react_native_config_1['default'] === null || react_native_config_1['default'] === void 0 ? void 0 : react_native_config_1['default'].ENVIRONMENT) !== null && _a !== void 0
            ? _a
            : CONST_1['default'].ENVIRONMENT.DEV) === CONST_1['default'].ENVIRONMENT.ADHOC &&
        ((_b = react_native_config_1['default'] === null || react_native_config_1['default'] === void 0 ? void 0 : react_native_config_1['default'].PULL_REQUEST_NUMBER) !== null &&
        _b !== void 0
            ? _b
            : '')
    );
}
exports.isInternalTestBuild = isInternalTestBuild;
/**
 * Get the URL based on the environment we are in
 */
function getEnvironmentURL() {
    return new Promise(function (resolve) {
        getEnvironment_1['default']().then(function (environment) {
            return resolve(ENVIRONMENT_URLS[environment]);
        });
    });
}
exports.getEnvironmentURL = getEnvironmentURL;
/**
 * Given the environment get the corresponding oldDot URL
 */
function getOldDotURLFromEnvironment(environment) {
    return OLDDOT_ENVIRONMENT_URLS[environment];
}
exports.getOldDotURLFromEnvironment = getOldDotURLFromEnvironment;
/**
 * Get the corresponding oldDot URL based on the environment we are in
 */
function getOldDotEnvironmentURL() {
    return getEnvironment_1['default']().then(function (environment) {
        return OLDDOT_ENVIRONMENT_URLS[environment];
    });
}
exports.getOldDotEnvironmentURL = getOldDotEnvironmentURL;
