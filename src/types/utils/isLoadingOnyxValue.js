"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isLoadingOnyxValue() {
    var results = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        results[_i] = arguments[_i];
    }
    return results.some(function (result) { return result.status === 'loading'; });
}
exports.default = isLoadingOnyxValue;
