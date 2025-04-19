
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (const p in s) {if (Object.prototype.hasOwnProperty.call(s, p)) {t[p] = s[p];}}
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
exports.__esModule = true;
const react_native_onyx_1 = require('react-native-onyx');
const Environment = require('@libs/Environment/Environment');
const getPlatform_1 = require('@libs/getPlatform');
const CONFIG_1 = require('@src/CONFIG');
const ONYXKEYS_1 = require('@src/ONYXKEYS');
const package_json_1 = require('../../../package.json');
const NetworkStore = require('./NetworkStore');
// For all requests, we'll send the lastUpdateID that is applied to this client. This will
// allow us to calculate previousUpdateID faster.
let lastUpdateIDAppliedToClient = -1;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback (value) {
        if (value) {
            lastUpdateIDAppliedToClient = value;
        } else {
            lastUpdateIDAppliedToClient = -1;
        }
    },
});
// Check if the user is logged in as a delegate and send that if so
let delegate = '';
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].ACCOUNT,
    callback (val) {
        let _a; let _b;
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
    let _a; let _b;
    const finalParameters = { ...parameters};
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
