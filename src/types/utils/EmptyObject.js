"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyObject = isEmptyObject;
function isEmptyObject(obj) {
    return Object.keys(obj !== null && obj !== void 0 ? obj : {}).length === 0;
}
