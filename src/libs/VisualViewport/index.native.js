"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Visual Viewport is not available on native, so return an empty function.
 */
var addViewportResizeListener = function () { return function () { }; };
exports.default = addViewportResizeListener;
