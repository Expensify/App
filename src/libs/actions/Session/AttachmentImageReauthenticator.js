"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var Authentication_1 = require("@libs/Authentication");
var Log_1 = require("@libs/Log");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var isOffline = false;
var active = false;
var currentActiveSession = {};
var timer;
// The delay before requesting a reauthentication once activated
// When the session is expired we will give it this time to reauthenticate via normal flows, like the Reauthentication middleware, in an attempt to not duplicate authentication requests
// also, this is an arbitrary number so we may tweak as needed
var TIMING_BEFORE_REAUTHENTICATION_MS = 3500; // 3.5s
// We subscribe to network's online/offline status
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NETWORK,
    callback: function (network) {
        if (!network) {
            return;
        }
        isOffline = !!network.shouldForceOffline || !!network.isOffline;
    },
});
// We subscribe to sessions changes
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (value) {
        if (!value || isSameSession(value) || !active) {
            return;
        }
        deactivate();
    },
});
function isSameSession(session) {
    return currentActiveSession.authToken === session.authToken && currentActiveSession.encryptedAuthToken === session.encryptedAuthToken;
}
function deactivate() {
    active = false;
    currentActiveSession = {};
    clearInterval(timer);
}
/**
 * The reauthenticator is currently only used by attachment images and only when the current session is expired.
 * It will only request reauthentication only once between two receptions of different sessions from Onyx
 * @param session the current session
 * @returns
 */
function activate(session) {
    if (!session || isSameSession(session) || isOffline) {
        return;
    }
    currentActiveSession = session;
    active = true;
    timer = setTimeout(tryReauthenticate, TIMING_BEFORE_REAUTHENTICATION_MS);
}
function tryReauthenticate() {
    if (isOffline || !active) {
        return;
    }
    (0, Authentication_1.reauthenticate)().catch(function (error) {
        Log_1.default.hmmm('Could not reauthenticate attachment image or receipt', { error: error });
    });
}
exports.default = activate;
