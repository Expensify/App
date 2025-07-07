"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCurrentDate = setCurrentDate;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function setCurrentDate(currentDate) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.CURRENT_DATE, currentDate);
}
