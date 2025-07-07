"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getSectionsWithIndexOffset;
/**
 * Returns a list of sections with indexOffset
 */
function getSectionsWithIndexOffset(sections) {
    return sections.map(function (section, index) {
        var indexOffset = __spreadArray([], sections, true).splice(0, index).reduce(function (acc, curr) { var _a, _b; return acc + ((_b = (_a = curr.data) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0); }, 0);
        return __assign(__assign({}, section), { indexOffset: indexOffset });
    });
}
