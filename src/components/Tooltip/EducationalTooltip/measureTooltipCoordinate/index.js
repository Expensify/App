"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = measureTooltipCoordinate;
exports.getTooltipCoordinates = getTooltipCoordinates;
function measureTooltipCoordinate(target, updateTargetBounds, showTooltip) {
    return target === null || target === void 0 ? void 0 : target.measureInWindow(function (x, y, width, height) {
        updateTargetBounds({ height: height, width: width, x: x, y: y });
        showTooltip();
    });
}
function getTooltipCoordinates(target, callback) {
    return target === null || target === void 0 ? void 0 : target.measureInWindow(function (x, y, width, height) {
        callback({ height: height, width: width, x: x, y: y });
    });
}
