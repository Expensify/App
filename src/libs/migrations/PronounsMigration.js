"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var react_native_onyx_1 = require("react-native-onyx");
var PersonalDetails = require("@userActions/PersonalDetails");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function getCurrentUserAccountIDFromOnyx() {
    return new Promise(function (resolve) {
        var connection = react_native_onyx_1.default.connect({
            key: ONYXKEYS_1.default.SESSION,
            callback: function (val) {
                var _a;
                react_native_onyx_1.default.disconnect(connection);
                return resolve((_a = val === null || val === void 0 ? void 0 : val.accountID) !== null && _a !== void 0 ? _a : -1);
            },
        });
    });
}
function getCurrentUserPersonalDetailsFromOnyx(currentUserAccountID) {
    return new Promise(function (resolve) {
        var connection = react_native_onyx_1.default.connect({
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            callback: function (val) {
                var _a;
                react_native_onyx_1.default.disconnect(connection);
                return resolve((_a = val === null || val === void 0 ? void 0 : val[currentUserAccountID]) !== null && _a !== void 0 ? _a : null);
            },
        });
    });
}
/**
 * This migration updates deprecated pronouns with new predefined ones.
 */
function default_1() {
    return getCurrentUserAccountIDFromOnyx()
        .then(getCurrentUserPersonalDetailsFromOnyx)
        .then(function (currentUserPersonalDetails) {
        var _a, _b, _c, _d;
        if (!currentUserPersonalDetails) {
            return;
        }
        var pronouns = (_b = (_a = currentUserPersonalDetails.pronouns) === null || _a === void 0 ? void 0 : _a.replace(CONST_1.default.PRONOUNS.PREFIX, '')) !== null && _b !== void 0 ? _b : '';
        if (!pronouns || CONST_1.default.PRONOUNS_LIST.includes(pronouns)) {
            return;
        }
        // Find the updated pronouns key replaceable for the deprecated value.
        var pronounsKey = (_d = (_c = Object.entries(CONST_1.default.DEPRECATED_PRONOUNS_LIST).find(function (deprecated) { return deprecated[1] === pronouns; })) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : '';
        // If couldn't find the updated pronouns, reset it to require user's manual update.
        PersonalDetails.updatePronouns(pronounsKey ? "".concat(CONST_1.default.PRONOUNS.PREFIX).concat(pronounsKey) : '');
    });
}
