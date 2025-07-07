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
exports.clearError = clearError;
exports.setDefaultData = setDefaultData;
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Clear CloseAccount error message to hide modal
 */
function clearError() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.CLOSE_ACCOUNT_FORM, { errors: null });
}
/**
 * Set default Onyx data
 */
function setDefaultData() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.CLOSE_ACCOUNT_FORM, __assign({}, CONST_1.default.DEFAULT_CLOSE_ACCOUNT_DATA));
}
