"use strict";
exports.__esModule = true;
exports.isSupportRequest = exports.isSupportAuthToken = exports.checkRequiredData = exports.getCredentials = exports.setIsAuthenticating = exports.isAuthenticating = exports.onReconnection = exports.isOffline = exports.resetHasReadRequiredDataFromStorage = exports.hasReadRequiredDataFromStorage = exports.getCurrentUserEmail = exports.setAuthToken = exports.getAuthToken = void 0;
var react_native_onyx_1 = require("react-native-onyx");
var types_1 = require("@libs/API/types");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var credentials;
var authToken;
var authTokenType;
var currentUserEmail = null;
var offline = false;
var authenticating = false;
// Allow code that is outside of the network listen for when a reconnection happens so that it can execute any side-effects (like flushing the sequential network queue)
var reconnectCallback;
function triggerReconnectCallback() {
    if (typeof reconnectCallback !== 'function') {
        return;
    }
    return reconnectCallback();
}
function onReconnection(callbackFunction) {
    reconnectCallback = callbackFunction;
}
exports.onReconnection = onReconnection;
var resolveIsReadyPromise;
var isReadyPromise = new Promise(function (resolve) {
    resolveIsReadyPromise = resolve;
});
/**
 * This is a hack to workaround the fact that Onyx may not yet have read these values from storage by the time Network starts processing requests.
 * If the values are undefined we haven't read them yet. If they are null or have a value then we have and the network is "ready".
 */
function checkRequiredData() {
    if (authToken === undefined || credentials === undefined) {
        return;
    }
    resolveIsReadyPromise();
}
exports.checkRequiredData = checkRequiredData;
function resetHasReadRequiredDataFromStorage() {
    // Create a new promise and a new resolve function
    isReadyPromise = new Promise(function (resolve) {
        resolveIsReadyPromise = resolve;
    });
}
exports.resetHasReadRequiredDataFromStorage = resetHasReadRequiredDataFromStorage;
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].SESSION,
    callback: function (val) {
        var _a, _b, _c;
        authToken = (_a = val === null || val === void 0 ? void 0 : val.authToken) !== null && _a !== void 0 ? _a : null;
        authTokenType = (_b = val === null || val === void 0 ? void 0 : val.authTokenType) !== null && _b !== void 0 ? _b : null;
        currentUserEmail = (_c = val === null || val === void 0 ? void 0 : val.email) !== null && _c !== void 0 ? _c : null;
        checkRequiredData();
    }
});
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].CREDENTIALS,
    callback: function (val) {
        credentials = val !== null && val !== void 0 ? val : null;
        checkRequiredData();
    }
});
// We subscribe to the online/offline status of the network to determine when we should fire off API calls
// vs queueing them for later.
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].NETWORK,
    callback: function (network) {
        if (!network) {
            return;
        }
        // Client becomes online emit connectivity resumed event
        if (offline && !network.isOffline) {
            triggerReconnectCallback();
        }
        offline = !!network.shouldForceOffline || !!network.isOffline;
    }
});
function getCredentials() {
    return credentials;
}
exports.getCredentials = getCredentials;
function isOffline() {
    return offline;
}
exports.isOffline = isOffline;
function getAuthToken() {
    return authToken;
}
exports.getAuthToken = getAuthToken;
function isSupportRequest(command) {
    return [
        types_1.WRITE_COMMANDS.OPEN_APP,
        types_1.WRITE_COMMANDS.SEARCH,
        types_1.WRITE_COMMANDS.UPDATE_NEWSLETTER_SUBSCRIPTION,
        types_1.WRITE_COMMANDS.OPEN_REPORT,
        types_1.SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP,
        types_1.READ_COMMANDS.OPEN_CARD_DETAILS_PAGE,
        types_1.READ_COMMANDS.GET_POLICY_CATEGORIES,
        types_1.READ_COMMANDS.OPEN_POLICY_CATEGORIES_PAGE,
        types_1.READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_PAGE,
        types_1.READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_FEED,
        types_1.READ_COMMANDS.OPEN_POLICY_DISTANCE_RATES_PAGE,
        types_1.READ_COMMANDS.OPEN_POLICY_ACCOUNTING_PAGE,
        types_1.READ_COMMANDS.OPEN_POLICY_EXPENSIFY_CARDS_PAGE,
        types_1.READ_COMMANDS.OPEN_POLICY_MORE_FEATURES_PAGE,
        types_1.READ_COMMANDS.OPEN_POLICY_PROFILE_PAGE,
        types_1.READ_COMMANDS.OPEN_POLICY_REPORT_FIELDS_PAGE,
        types_1.READ_COMMANDS.OPEN_POLICY_INITIAL_PAGE,
        types_1.READ_COMMANDS.OPEN_INITIAL_SETTINGS_PAGE,
        types_1.READ_COMMANDS.OPEN_POLICY_TAGS_PAGE,
        types_1.READ_COMMANDS.OPEN_SUBSCRIPTION_PAGE,
        types_1.READ_COMMANDS.OPEN_POLICY_TAXES_PAGE,
        types_1.READ_COMMANDS.OPEN_POLICY_WORKFLOWS_PAGE,
        types_1.READ_COMMANDS.OPEN_WORKSPACE_VIEW,
        types_1.READ_COMMANDS.OPEN_PAYMENTS_PAGE,
        types_1.READ_COMMANDS.OPEN_WORKSPACE_MEMBERS_PAGE,
        types_1.READ_COMMANDS.SEARCH_FOR_REPORTS,
    ].some(function (cmd) { return cmd === command; });
}
exports.isSupportRequest = isSupportRequest;
function isSupportAuthToken() {
    return authTokenType === CONST_1["default"].AUTH_TOKEN_TYPES.SUPPORT;
}
exports.isSupportAuthToken = isSupportAuthToken;
function setAuthToken(newAuthToken) {
    authToken = newAuthToken;
}
exports.setAuthToken = setAuthToken;
function getCurrentUserEmail() {
    return currentUserEmail;
}
exports.getCurrentUserEmail = getCurrentUserEmail;
function hasReadRequiredDataFromStorage() {
    return isReadyPromise;
}
exports.hasReadRequiredDataFromStorage = hasReadRequiredDataFromStorage;
function isAuthenticating() {
    return authenticating;
}
exports.isAuthenticating = isAuthenticating;
function setIsAuthenticating(val) {
    authenticating = val;
}
exports.setIsAuthenticating = setIsAuthenticating;
