"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Allows us to identify whether the platform is hoverable.
 */
var hasHoverSupport = function () { var _a; return (_a = window.matchMedia) === null || _a === void 0 ? void 0 : _a.call(window, '(hover: hover) and (pointer: fine)').matches; };
exports.default = hasHoverSupport;
