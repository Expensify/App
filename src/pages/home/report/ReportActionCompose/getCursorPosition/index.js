"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getCursorPosition(_a) {
    var _b, _c;
    var positionOnWeb = _a.positionOnWeb;
    var x = (_b = positionOnWeb === null || positionOnWeb === void 0 ? void 0 : positionOnWeb.positionX) !== null && _b !== void 0 ? _b : 0;
    var y = (_c = positionOnWeb === null || positionOnWeb === void 0 ? void 0 : positionOnWeb.positionY) !== null && _c !== void 0 ? _c : 0;
    return { x: x, y: y };
}
exports.default = getCursorPosition;
