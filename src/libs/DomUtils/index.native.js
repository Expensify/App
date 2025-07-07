"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getActiveElement = function () { return null; };
var addCSS = function () { };
var getAutofilledInputStyle = function () { return null; };
var requestAnimationFrame = function (callback) {
    if (!callback) {
        return;
    }
    callback();
};
exports.default = {
    addCSS: addCSS,
    getAutofilledInputStyle: getAutofilledInputStyle,
    getActiveElement: getActiveElement,
    requestAnimationFrame: requestAnimationFrame,
};
