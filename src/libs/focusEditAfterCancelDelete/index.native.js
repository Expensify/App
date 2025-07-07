"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var focusEditAfterCancelDelete = function (textInputRef) {
    react_native_1.InteractionManager.runAfterInteractions(function () { return textInputRef === null || textInputRef === void 0 ? void 0 : textInputRef.focus(); });
};
exports.default = focusEditAfterCancelDelete;
