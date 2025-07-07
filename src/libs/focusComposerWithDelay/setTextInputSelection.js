"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shouldSetSelectionRange_1 = require("@libs/shouldSetSelectionRange");
var setSelectionRange = (0, shouldSetSelectionRange_1.default)();
var setTextInputSelection = function (textInput, forcedSelectionRange) {
    if (setSelectionRange) {
        textInput.setSelectionRange(forcedSelectionRange.start, forcedSelectionRange.end);
    }
    else {
        textInput.setSelection(forcedSelectionRange.start, forcedSelectionRange.end);
    }
};
exports.default = setTextInputSelection;
