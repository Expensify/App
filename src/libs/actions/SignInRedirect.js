"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var lastVisitedTabPathUtils_1 = require("@libs/Navigation/helpers/lastVisitedTabPathUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Policy_1 = require("./Policy/Policy");
var currentIsOffline;
var currentShouldForceOffline;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NETWORK,
    callback: function (network) {
        currentIsOffline = network === null || network === void 0 ? void 0 : network.isOffline;
        currentShouldForceOffline = network === null || network === void 0 ? void 0 : network.shouldForceOffline;
    },
});
function clearStorageAndRedirect(errorMessage) {
    // Under certain conditions, there are key-values we'd like to keep in storage even when a user is logged out.
    // We pass these into the clear() method in order to avoid having to reset them on a delayed tick and getting
    // flashes of unwanted default state.
    var keysToPreserve = [];
    keysToPreserve.push(ONYXKEYS_1.default.NVP_PREFERRED_LOCALE);
    keysToPreserve.push(ONYXKEYS_1.default.ARE_TRANSLATIONS_LOADING);
    keysToPreserve.push(ONYXKEYS_1.default.PREFERRED_THEME);
    keysToPreserve.push(ONYXKEYS_1.default.ACTIVE_CLIENTS);
    keysToPreserve.push(ONYXKEYS_1.default.DEVICE_ID);
    // After signing out, set ourselves as offline if we were offline before logging out and we are not forcing it.
    // If we are forcing offline, ignore it while signed out, otherwise it would require a refresh because there's no way to toggle the switch to go back online while signed out.
    if (currentIsOffline && !currentShouldForceOffline) {
        keysToPreserve.push(ONYXKEYS_1.default.NETWORK);
    }
    return react_native_onyx_1.default.clear(keysToPreserve).then(function () {
        (0, Policy_1.clearAllPolicies)();
        if (!errorMessage) {
            return;
        }
        // `Onyx.clear` reinitializes the Onyx instance with initial values so use `Onyx.merge` instead of `Onyx.set`
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithMessage)(errorMessage) });
    });
}
/**
 * Cleanup actions resulting in the user being redirected to the Sign-in page
 * - Clears the Onyx store - removing the authToken redirects the user to the Sign-in page
 *
 * Normally this method would live in Session.js, but that would cause a circular dependency with Network.js.
 *
 * @param [errorMessage] error message to be displayed on the sign in page
 */
function redirectToSignIn(errorMessage) {
    return clearStorageAndRedirect(errorMessage).then(function () {
        (0, lastVisitedTabPathUtils_1.clearSessionStorage)();
    });
}
exports.default = redirectToSignIn;
