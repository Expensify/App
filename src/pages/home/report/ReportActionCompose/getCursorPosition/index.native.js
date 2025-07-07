"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getCursorPosition(_a) {
    var _b, _c;
    var positionOnMobile = _a.positionOnMobile;
    return {
        x: (_b = positionOnMobile === null || positionOnMobile === void 0 ? void 0 : positionOnMobile.x) !== null && _b !== void 0 ? _b : 0,
        y: (_c = positionOnMobile === null || positionOnMobile === void 0 ? void 0 : positionOnMobile.y) !== null && _c !== void 0 ? _c : 0,
    };
}
exports.default = getCursorPosition;
