"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getHistoryParamParse = function (historyParamName) {
    var _a;
    return (_a = {},
        _a[historyParamName] = function (value) { return value === 'true'; },
        _a);
};
exports.default = getHistoryParamParse;
