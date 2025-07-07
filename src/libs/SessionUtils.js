"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLoggingInAsNewUser = isLoggingInAsNewUser;
exports.didUserLogInDuringSession = didUserLogInDuringSession;
exports.resetDidUserLogInDuringSession = resetDidUserLogInDuringSession;
exports.getSession = getSession;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Determine if the transitioning user is logging in as a new user.
 */
function isLoggingInAsNewUser(transitionURL, sessionEmail) {
    var _a;
    // The OldDot mobile app does not URL encode the parameters, but OldDot web
    // does. We don't want to deploy OldDot mobile again, so as a work around we
    // compare the session email to both the decoded and raw email from the transition link.
    var params = new URLSearchParams(transitionURL);
    var paramsEmail = params.get('email');
    // If the email param matches what is stored in the session then we are
    // definitely not logging in as a new user
    if (paramsEmail === sessionEmail) {
        return false;
    }
    // If they do not match it might be due to encoding, so check the raw value
    // Capture the un-encoded text in the email param
    var emailParamRegex = /[?&]email=([^&]*)/g;
    var matches = emailParamRegex.exec(transitionURL !== null && transitionURL !== void 0 ? transitionURL : '');
    var linkedEmail = (_a = matches === null || matches === void 0 ? void 0 : matches[1]) !== null && _a !== void 0 ? _a : null;
    return linkedEmail !== sessionEmail;
}
var loggedInDuringSession;
var currentSession;
// To tell if the user logged in during this session we will check the value of session.authToken once when the app's JS inits. When the user logs out
// we can reset this flag so that it can be updated again.
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (session) {
        currentSession = session;
        if (loggedInDuringSession) {
            return;
        }
        // We are incorporating a check for 'signedInWithShortLivedAuthToken' to handle cases where login is performed using a ShortLivedAuthToken
        // This check is necessary because, with ShortLivedAuthToken, 'authToken' gets populated, leading to 'loggedInDuringSession' being assigned a false value
        if ((session === null || session === void 0 ? void 0 : session.authToken) && !(session === null || session === void 0 ? void 0 : session.signedInWithShortLivedAuthToken)) {
            loggedInDuringSession = false;
        }
        else {
            loggedInDuringSession = true;
        }
    },
});
function resetDidUserLogInDuringSession() {
    loggedInDuringSession = true;
}
function didUserLogInDuringSession() {
    return !!loggedInDuringSession;
}
function getSession() {
    return currentSession;
}
