"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Check platform supports the selector or not
 */
var isSelectorSupported = function (selector) {
    try {
        document.querySelector(selector);
        return true;
    }
    catch (error) {
        return false;
    }
};
exports.default = isSelectorSupported;
