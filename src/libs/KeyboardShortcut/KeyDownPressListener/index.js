"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeKeyDownPressListener = exports.addKeyDownPressListener = void 0;
var addKeyDownPressListener = function (callbackFunction) {
    document.addEventListener('keydown', callbackFunction);
};
exports.addKeyDownPressListener = addKeyDownPressListener;
var removeKeyDownPressListener = function (callbackFunction) {
    document.removeEventListener('keydown', callbackFunction);
};
exports.removeKeyDownPressListener = removeKeyDownPressListener;
