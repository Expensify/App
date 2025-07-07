"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var blurActiveElement = function () {
    if (!(document.activeElement instanceof HTMLElement)) {
        return;
    }
    document.activeElement.blur();
};
exports.default = blurActiveElement;
