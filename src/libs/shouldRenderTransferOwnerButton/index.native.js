"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isEmpty_1 = require("lodash/isEmpty");
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var fundList;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.FUND_LIST,
    callback: function (value) {
        if (!value) {
            return;
        }
        fundList = value;
    },
});
var shouldRenderTransferOwnerButton = function () {
    return !(0, isEmpty_1.default)(fundList);
};
exports.default = shouldRenderTransferOwnerButton;
