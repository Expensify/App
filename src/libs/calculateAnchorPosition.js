"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = calculateAnchorPosition;
var CONST_1 = require("@src/CONST");
/**
 * Gets the x,y position of the passed in component for the purpose of anchoring another component to it.
 */
function calculateAnchorPosition(anchorComponent, anchorOrigin) {
    return new Promise(function (resolve) {
        if (!anchorComponent || !('measureInWindow' in anchorComponent)) {
            resolve({ horizontal: 0, vertical: 0, width: 0, height: 0 });
            return;
        }
        anchorComponent.measureInWindow(function (x, y, width, height) {
            var _a, _b;
            if ((anchorOrigin === null || anchorOrigin === void 0 ? void 0 : anchorOrigin.vertical) === CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP && (anchorOrigin === null || anchorOrigin === void 0 ? void 0 : anchorOrigin.horizontal) === CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT) {
                resolve({ horizontal: x, vertical: y + height + ((_a = anchorOrigin === null || anchorOrigin === void 0 ? void 0 : anchorOrigin.shiftVertical) !== null && _a !== void 0 ? _a : 0), width: width, height: height });
                return;
            }
            resolve({ horizontal: x + width, vertical: y + ((_b = anchorOrigin === null || anchorOrigin === void 0 ? void 0 : anchorOrigin.shiftVertical) !== null && _b !== void 0 ? _b : 0), width: width, height: height });
        });
    });
}
