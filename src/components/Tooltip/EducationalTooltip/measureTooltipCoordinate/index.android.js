"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = measureTooltipCoordinate;
exports.getTooltipCoordinates = getTooltipCoordinates;
function measureTooltipCoordinate(target, updateTargetBounds, showTooltip) {
    return target === null || target === void 0 ? void 0 : target.measure(function (x, y, width, height, px, py) {
        updateTargetBounds({ height: height, width: width, x: px, y: py });
        showTooltip();
    });
}
function getTooltipCoordinates(target, callback) {
    return target === null || target === void 0 ? void 0 : target.measure(function (x, y, width, height, px, py) {
        callback({ height: height, width: width, x: px, y: py });
    });
}
