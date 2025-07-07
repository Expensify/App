"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turnOffMobileSelectionMode = exports.turnOnMobileSelectionMode = void 0;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var turnOnMobileSelectionMode = function () {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.MOBILE_SELECTION_MODE, { isEnabled: true });
};
exports.turnOnMobileSelectionMode = turnOnMobileSelectionMode;
var turnOffMobileSelectionMode = function () {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.MOBILE_SELECTION_MODE, { isEnabled: false });
};
exports.turnOffMobileSelectionMode = turnOffMobileSelectionMode;
