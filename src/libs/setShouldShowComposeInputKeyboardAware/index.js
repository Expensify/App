"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Composer = require("@userActions/Composer");
var setShouldShowComposeInputKeyboardAware = function (shouldShow) {
    // We want to show the main composer when the edit composer loses focus.
    // If it loses focus due to a pressable being pressed, the press event might not be captured.
    // To address this, we delay showing the main composer to allow the press event to be completed.
    setTimeout(function () {
        Composer.setShouldShowComposeInput(shouldShow);
    }, 0);
};
exports.default = setShouldShowComposeInputKeyboardAware;
