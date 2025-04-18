"use strict";
exports.__esModule = true;
exports.isUsingStagingApi = exports.getCommandURL = exports.getApiRoot = void 0;
var react_native_onyx_1 = require("react-native-onyx");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var proxyConfig_1 = require("../../config/proxyConfig");
var Environment_1 = require("./Environment/Environment");
// To avoid rebuilding native apps, native apps use production config for both staging and prod
// We use the async environment check because it works on all platforms
var ENV_NAME = CONST_1["default"].ENVIRONMENT.PRODUCTION;
var shouldUseStagingServer = false;
Environment_1.getEnvironment().then(function (envName) {
    ENV_NAME = envName;
    // We connect here, so we have the updated ENV_NAME when Onyx callback runs
    react_native_onyx_1["default"].connect({
        key: ONYXKEYS_1["default"].USER,
        callback: function (value) {
            var _a;
            // Toggling between APIs is not allowed on production and internal dev environment
            if (ENV_NAME === CONST_1["default"].ENVIRONMENT.PRODUCTION || CONFIG_1["default"].IS_USING_LOCAL_WEB) {
                shouldUseStagingServer = false;
                return;
            }
            var defaultToggleState = ENV_NAME === CONST_1["default"].ENVIRONMENT.STAGING || ENV_NAME === CONST_1["default"].ENVIRONMENT.ADHOC;
            shouldUseStagingServer = (_a = value === null || value === void 0 ? void 0 : value.shouldUseStagingServer) !== null && _a !== void 0 ? _a : defaultToggleState;
        }
    });
});
/**
 * Get the currently used API endpoint, unless forceProduction is set to true
 * (Non-production environments allow for dynamically switching the API)
 */
function getApiRoot(request, forceProduction) {
    var _a;
    if (forceProduction === void 0) { forceProduction = false; }
    var shouldUseSecure = (_a = request === null || request === void 0 ? void 0 : request.shouldUseSecure) !== null && _a !== void 0 ? _a : false;
    if (shouldUseStagingServer && forceProduction !== true) {
        if (CONFIG_1["default"].IS_USING_WEB_PROXY && !(request === null || request === void 0 ? void 0 : request.shouldSkipWebProxy)) {
            return shouldUseSecure ? proxyConfig_1["default"].STAGING_SECURE : proxyConfig_1["default"].STAGING;
        }
        return shouldUseSecure ? CONFIG_1["default"].EXPENSIFY.STAGING_SECURE_API_ROOT : CONFIG_1["default"].EXPENSIFY.STAGING_API_ROOT;
    }
    if (request === null || request === void 0 ? void 0 : request.shouldSkipWebProxy) {
        return shouldUseSecure ? CONFIG_1["default"].EXPENSIFY.SECURE_EXPENSIFY_URL : CONFIG_1["default"].EXPENSIFY.EXPENSIFY_URL;
    }
    return shouldUseSecure ? CONFIG_1["default"].EXPENSIFY.DEFAULT_SECURE_API_ROOT : CONFIG_1["default"].EXPENSIFY.DEFAULT_API_ROOT;
}
exports.getApiRoot = getApiRoot;
/**
 * Get the command url for the given request
 * @param - the name of the API command
 */
function getCommandURL(request) {
    // If request.command already contains ? then we don't need to append it
    return getApiRoot(request) + "api/" + request.command + (request.command.includes('?') ? '' : '?');
}
exports.getCommandURL = getCommandURL;
/**
 * Check if we're currently using the staging API root
 */
function isUsingStagingApi() {
    return shouldUseStagingServer;
}
exports.isUsingStagingApi = isUsingStagingApi;
