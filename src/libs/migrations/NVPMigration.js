"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var after_1 = require("lodash/after");
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
// These are the oldKeyName: newKeyName of the NVPs we can migrate without any processing
var migrations = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    nvp_lastPaymentMethod: ONYXKEYS_1.default.NVP_LAST_PAYMENT_METHOD,
    preferredLocale: ONYXKEYS_1.default.NVP_PREFERRED_LOCALE,
    preferredEmojiSkinTone: ONYXKEYS_1.default.PREFERRED_EMOJI_SKIN_TONE,
    frequentlyUsedEmojis: ONYXKEYS_1.default.FREQUENTLY_USED_EMOJIS,
    private_blockedFromConcierge: ONYXKEYS_1.default.NVP_BLOCKED_FROM_CONCIERGE,
    private_pushNotificationID: ONYXKEYS_1.default.NVP_PRIVATE_PUSH_NOTIFICATION_ID,
    tryFocusMode: ONYXKEYS_1.default.NVP_TRY_FOCUS_MODE,
    introSelected: ONYXKEYS_1.default.NVP_INTRO_SELECTED,
    preferredTheme: ONYXKEYS_1.default.PREFERRED_THEME,
};
// This migration changes the keys of all the NVP related keys so that they are standardized
function default_1() {
    return new Promise(function (resolve) {
        // Resolve the migration when all the keys have been migrated. The number of keys is the size of the `migrations` object in addition to the ACCOUNT and OLD_POLICY_RECENTLY_USED_TAGS keys (which is why there is a +2).
        var resolveWhenDone = (0, after_1.default)(Object.entries(migrations).length + 2, function () { return resolve(); });
        var _loop_1 = function (oldKey, newKey) {
            var connection = react_native_onyx_1.default.connect({
                key: oldKey,
                callback: function (value) {
                    var _a;
                    react_native_onyx_1.default.disconnect(connection);
                    if (value === undefined) {
                        resolveWhenDone();
                        return;
                    }
                    react_native_onyx_1.default.multiSet((_a = {},
                        _a[newKey] = value,
                        _a[oldKey] = null,
                        _a)).then(resolveWhenDone);
                },
            });
        };
        for (var _i = 0, _a = Object.entries(migrations); _i < _a.length; _i++) {
            var _b = _a[_i], oldKey = _b[0], newKey = _b[1];
            _loop_1(oldKey, newKey);
        }
        var accountConnection = react_native_onyx_1.default.connect({
            key: ONYXKEYS_1.default.ACCOUNT,
            callback: function (value) {
                var _a;
                react_native_onyx_1.default.disconnect(accountConnection);
                if (!(value === null || value === void 0 ? void 0 : value.activePolicyID)) {
                    resolveWhenDone();
                    return;
                }
                var activePolicyID = value.activePolicyID;
                var newValue = __assign({}, value);
                delete newValue.activePolicyID;
                react_native_onyx_1.default.multiSet((_a = {},
                    _a[ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID] = activePolicyID,
                    _a[ONYXKEYS_1.default.ACCOUNT] = newValue,
                    _a)).then(resolveWhenDone);
            },
        });
        var recentlyUsedTagsConnection = react_native_onyx_1.default.connect({
            key: ONYXKEYS_1.default.COLLECTION.OLD_POLICY_RECENTLY_USED_TAGS,
            waitForCollectionCallback: true,
            callback: function (value) {
                react_native_onyx_1.default.disconnect(recentlyUsedTagsConnection);
                if (!value) {
                    resolveWhenDone();
                    return;
                }
                var newValue = {};
                for (var _i = 0, _a = Object.keys(value); _i < _a.length; _i++) {
                    var key = _a[_i];
                    newValue["nvp_".concat(key)] = value[key];
                    newValue[key] = null;
                }
                react_native_onyx_1.default.multiSet(newValue).then(resolveWhenDone);
            },
        });
    });
}
