'use strict';
exports.__esModule = true;
exports.formatToParts = exports.format = void 0;
var memoize_1 = require('@libs/memoize');
var intlPolyfill_1 = require('./intlPolyfill');
intlPolyfill_1['default']();
var MemoizedNumberFormat = memoize_1['default'](Intl.NumberFormat, {maxSize: 10, monitoringName: 'NumberFormatUtils'});
function format(locale, number, options) {
    return new MemoizedNumberFormat(locale, options).format(number);
}
exports.format = format;
function formatToParts(locale, number, options) {
    return new MemoizedNumberFormat(locale, options).formatToParts(number);
}
exports.formatToParts = formatToParts;
