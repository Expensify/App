"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Add a visual viewport resize listener if available. Return a function to remove the listener.
 */
var addViewportResizeListener = function (onViewportResize) {
    if (!window.visualViewport) {
        return function () { };
    }
    window.visualViewport.addEventListener('resize', onViewportResize);
    return function () { var _a; return (_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.removeEventListener('resize', onViewportResize); };
};
exports.default = addViewportResizeListener;
