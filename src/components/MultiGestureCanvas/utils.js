"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCanvasFitScale = void 0;
exports.clamp = clamp;
/** Clamps a value between a lower and upper bound */
function clamp(value, lowerBound, upperBound) {
    'worklet';
    return Math.min(Math.max(lowerBound, value), upperBound);
}
var getCanvasFitScale = function (_a) {
    var canvasSize = _a.canvasSize, contentSize = _a.contentSize;
    var scaleX = clamp(canvasSize.width / contentSize.width, 0, 1);
    var scaleY = clamp(canvasSize.height / contentSize.height, 0, 1);
    var minScale = Math.min(scaleX, scaleY);
    var maxScale = Math.max(scaleX, scaleY);
    return { scaleX: scaleX, scaleY: scaleY, minScale: minScale, maxScale: maxScale };
};
exports.getCanvasFitScale = getCanvasFitScale;
