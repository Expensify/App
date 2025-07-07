"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueOnyxUpdates = queueOnyxUpdates;
exports.flushQueue = flushQueue;
exports.isEmpty = isEmpty;
var react_native_onyx_1 = require("react-native-onyx");
var CONFIG_1 = require("@src/CONFIG");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
// In this file we manage a queue of Onyx updates while the SequentialQueue is processing. There are functions to get the updates and clear the queue after saving the updates in Onyx.
var queuedOnyxUpdates = [];
var currentAccountID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (session) {
        currentAccountID = session === null || session === void 0 ? void 0 : session.accountID;
    },
});
/**
 * @param updates Onyx updates to queue for later
 */
function queueOnyxUpdates(updates) {
    queuedOnyxUpdates = queuedOnyxUpdates.concat(updates);
    return Promise.resolve();
}
function flushQueue() {
    var copyUpdates = __spreadArray([], queuedOnyxUpdates, true);
    // Clear queue immediately to prevent race conditions with new updates during Onyx processing
    queuedOnyxUpdates = [];
    if (!currentAccountID && !CONFIG_1.default.IS_TEST_ENV && !CONFIG_1.default.E2E_TESTING) {
        var preservedKeys_1 = [
            ONYXKEYS_1.default.NVP_TRY_FOCUS_MODE,
            ONYXKEYS_1.default.PREFERRED_THEME,
            ONYXKEYS_1.default.NVP_PREFERRED_LOCALE,
            ONYXKEYS_1.default.ARE_TRANSLATIONS_LOADING,
            ONYXKEYS_1.default.SESSION,
            ONYXKEYS_1.default.IS_LOADING_APP,
            ONYXKEYS_1.default.HAS_LOADED_APP,
            ONYXKEYS_1.default.CREDENTIALS,
            ONYXKEYS_1.default.IS_SIDEBAR_LOADED,
            ONYXKEYS_1.default.ACCOUNT,
            ONYXKEYS_1.default.IS_CHECKING_PUBLIC_ROOM,
            ONYXKEYS_1.default.MODAL,
            ONYXKEYS_1.default.NETWORK,
            ONYXKEYS_1.default.SHOULD_SHOW_COMPOSE_INPUT,
            ONYXKEYS_1.default.PRESERVED_USER_SESSION,
        ];
        copyUpdates = copyUpdates.filter(function (update) { return preservedKeys_1.includes(update.key); });
    }
    return react_native_onyx_1.default.update(copyUpdates);
}
function isEmpty() {
    return queuedOnyxUpdates.length === 0;
}
