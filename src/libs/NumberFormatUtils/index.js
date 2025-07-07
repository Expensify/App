"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = format;
exports.formatToParts = formatToParts;
var memoize_1 = require("@libs/memoize");
var CONST_1 = require("@src/CONST");
var intlPolyfill_1 = require("./intlPolyfill");
(0, intlPolyfill_1.default)();
var MemoizedNumberFormat = (0, memoize_1.default)(Intl.NumberFormat, { maxSize: 10, monitoringName: 'NumberFormatUtils' });
function format(locale, number, options) {
    return new MemoizedNumberFormat(locale !== null && locale !== void 0 ? locale : CONST_1.default.LOCALES.DEFAULT, options).format(number);
}
function formatToParts(locale, number, options) {
    return new MemoizedNumberFormat(locale !== null && locale !== void 0 ? locale : CONST_1.default.LOCALES.DEFAULT, options).formatToParts(number);
}
