"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvironment = void 0;
exports.isInternalTestBuild = isInternalTestBuild;
exports.isDevelopment = isDevelopment;
exports.isProduction = isProduction;
exports.getEnvironmentURL = getEnvironmentURL;
exports.getOldDotEnvironmentURL = getOldDotEnvironmentURL;
exports.getOldDotURLFromEnvironment = getOldDotURLFromEnvironment;
var react_native_config_1 = require("react-native-config");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var getEnvironment_1 = require("./getEnvironment");
exports.getEnvironment = getEnvironment_1.default;
var ENVIRONMENT_URLS = (_a = {},
    _a[CONST_1.default.ENVIRONMENT.DEV] = CONST_1.default.DEV_NEW_EXPENSIFY_URL + CONFIG_1.default.DEV_PORT,
    _a[CONST_1.default.ENVIRONMENT.STAGING] = CONST_1.default.STAGING_NEW_EXPENSIFY_URL,
    _a[CONST_1.default.ENVIRONMENT.PRODUCTION] = CONST_1.default.NEW_EXPENSIFY_URL,
    _a[CONST_1.default.ENVIRONMENT.ADHOC] = CONST_1.default.STAGING_NEW_EXPENSIFY_URL,
    _a);
var OLDDOT_ENVIRONMENT_URLS = (_b = {},
    _b[CONST_1.default.ENVIRONMENT.DEV] = CONST_1.default.INTERNAL_DEV_EXPENSIFY_URL,
    _b[CONST_1.default.ENVIRONMENT.STAGING] = CONST_1.default.STAGING_EXPENSIFY_URL,
    _b[CONST_1.default.ENVIRONMENT.PRODUCTION] = CONST_1.default.EXPENSIFY_URL,
    _b[CONST_1.default.ENVIRONMENT.ADHOC] = CONST_1.default.STAGING_EXPENSIFY_URL,
    _b);
/**
 * Are we running the app in development?
 */
function isDevelopment() {
    var _a;
    return ((_a = react_native_config_1.default === null || react_native_config_1.default === void 0 ? void 0 : react_native_config_1.default.ENVIRONMENT) !== null && _a !== void 0 ? _a : CONST_1.default.ENVIRONMENT.DEV) === CONST_1.default.ENVIRONMENT.DEV;
}
/**
 * Are we running the app in production?
 */
function isProduction() {
    return (0, getEnvironment_1.default)().then(function (environment) { return environment === CONST_1.default.ENVIRONMENT.PRODUCTION; });
}
/**
 * Are we running an internal test build?
 */
function isInternalTestBuild() {
    var _a, _b;
    return !!(((_a = react_native_config_1.default === null || react_native_config_1.default === void 0 ? void 0 : react_native_config_1.default.ENVIRONMENT) !== null && _a !== void 0 ? _a : CONST_1.default.ENVIRONMENT.DEV) === CONST_1.default.ENVIRONMENT.ADHOC && ((_b = react_native_config_1.default === null || react_native_config_1.default === void 0 ? void 0 : react_native_config_1.default.PULL_REQUEST_NUMBER) !== null && _b !== void 0 ? _b : ''));
}
/**
 * Get the URL based on the environment we are in
 */
function getEnvironmentURL() {
    return new Promise(function (resolve) {
        (0, getEnvironment_1.default)().then(function (environment) { return resolve(ENVIRONMENT_URLS[environment]); });
    });
}
/**
 * Given the environment get the corresponding oldDot URL
 */
function getOldDotURLFromEnvironment(environment) {
    return OLDDOT_ENVIRONMENT_URLS[environment];
}
/**
 * Get the corresponding oldDot URL based on the environment we are in
 */
function getOldDotEnvironmentURL() {
    return (0, getEnvironment_1.default)().then(function (environment) { return OLDDOT_ENVIRONMENT_URLS[environment]; });
}
