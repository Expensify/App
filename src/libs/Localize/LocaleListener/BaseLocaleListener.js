"use strict";
exports.__esModule = true;
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var preferredLocale = CONST_1["default"].LOCALES.DEFAULT;
/**
 * Adds event listener for changes to the locale. Callbacks are executed when the locale changes in Onyx.
 */
var connect = function (callbackAfterChange) {
    if (callbackAfterChange === void 0) { callbackAfterChange = function () { }; }
    react_native_onyx_1["default"].connect({
        key: ONYXKEYS_1["default"].NVP_PREFERRED_LOCALE,
        callback: function (val) {
            if (!val || val === preferredLocale) {
                return;
            }
            preferredLocale = val;
            callbackAfterChange(val);
        }
    });
};
function getPreferredLocale() {
    return preferredLocale;
}
var BaseLocaleListener = {
    connect: connect,
    getPreferredLocale: getPreferredLocale
};
exports["default"] = BaseLocaleListener;
