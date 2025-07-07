"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callback = void 0;
exports.composerFocusKeepFocusOn = composerFocusKeepFocusOn;
exports.inputFocusChange = inputFocusChange;
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var Browser = require("@libs/Browser");
var ReportActionComposeFocusManager_1 = require("@libs/ReportActionComposeFocusManager");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function inputFocusChange(focus) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.INPUT_FOCUSED, focus);
}
var refSave;
function composerFocusKeepFocusOn(ref, isFocused, modal, onyxFocused) {
    if (isFocused && !onyxFocused) {
        inputFocusChange(true);
        ref.focus();
    }
    if (isFocused) {
        refSave = ref;
    }
    if (!isFocused && !onyxFocused && !modal.willAlertModalBecomeVisible && !modal.isVisible && refSave) {
        if (!ReportActionComposeFocusManager_1.default.isFocused()) {
            // Focusing will fail when it is called immediately after closing modal so we call it after interaction.
            react_native_1.InteractionManager.runAfterInteractions(function () {
                refSave === null || refSave === void 0 ? void 0 : refSave.focus();
            });
        }
        else {
            refSave = undefined;
        }
    }
}
var callback = function (method) { return !Browser.isMobile() && method(); };
exports.callback = callback;
