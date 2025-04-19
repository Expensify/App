'use strict';
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
exports.__esModule = true;
var react_native_onyx_1 = require('react-native-onyx');
var Environment = require('@libs/Environment/Environment');
var getPlatform_1 = require('@libs/getPlatform');
var CONFIG_1 = require('@src/CONFIG');
var ONYXKEYS_1 = require('@src/ONYXKEYS');
var package_json_1 = require('../../../package.json');
var NetworkStore = require('./NetworkStore');
// For all requests, we'll send the lastUpdateID that is applied to this client. This will
// allow us to calculate previousUpdateID faster.
var lastUpdateIDAppliedToClient = -1;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: function (value) {
        if (value) {
            lastUpdateIDAppliedToClient = value;
        } else {
            lastUpdateIDAppliedToClient = -1;
        }
    },
});
// Check if the user is logged in as a delegate and send that if so
var delegate = '';
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].ACCOUNT,
    callback: function (val) {
        var _a, _b;
        delegate = (_b = (_a = val === null || val === void 0 ? void 0 : val.delegatedAccess) === null || _a === void 0 ? void 0 : _a.delegate) !== null && _b !== void 0 ? _b : '';
    },
});
/**
 * Does this command require an authToken?
 */
function isAuthTokenRequired(command) {
    return !['Log', 'Authenticate', 'BeginSignIn', 'SetPassword'].includes(command);
}
/**
 * Adds default values to our request data
 */
function enhanceParameters(command, parameters) {
    var _a, _b;
    var finalParameters = __assign({}, parameters);
    if (isAuthTokenRequired(command) && !parameters.authToken) {
        finalParameters.authToken = (_a = NetworkStore.getAuthToken()) !== null && _a !== void 0 ? _a : null;
    }
    finalParameters.referer = CONFIG_1['default'].EXPENSIFY.EXPENSIFY_CASH_REFERER;
    // In addition to the referer (ecash), we pass the platform to help differentiate what device type
    // is sending the request.
    finalParameters.platform = getPlatform_1['default']();
    // This application does not save its authToken in cookies like the classic Expensify app.
    // Setting api_setCookie to false will ensure that the Expensify API doesn't set any cookies
    // and prevents interfering with the cookie authToken that Expensify classic uses.
    finalParameters.api_setCookie = false;
    // Include current user's email in every request and the server logs
    finalParameters.email = (_b = parameters.email) !== null && _b !== void 0 ? _b : NetworkStore.getCurrentUserEmail();
    finalParameters.isFromDevEnv = Environment.isDevelopment();
    finalParameters.appversion = package_json_1['default'].version;
    finalParameters.clientUpdateID = lastUpdateIDAppliedToClient;
    if (delegate) {
        finalParameters.delegate = delegate;
    }
    return finalParameters;
}
exports['default'] = enhanceParameters;
