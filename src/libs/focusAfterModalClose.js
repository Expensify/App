"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ComposerFocusManager_1 = require("./ComposerFocusManager");
var isWindowReadyToFocus_1 = require("./isWindowReadyToFocus");
function focusAfterModalClose(textInput) {
    if (!textInput) {
        return;
    }
    Promise.all([ComposerFocusManager_1.default.isReadyToFocus(), (0, isWindowReadyToFocus_1.default)()]).then(function () {
        textInput === null || textInput === void 0 ? void 0 : textInput.focus();
    });
}
exports.default = focusAfterModalClose;
