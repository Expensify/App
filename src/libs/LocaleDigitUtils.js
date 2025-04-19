'use strict';
var __spreadArrays =
    (this && this.__spreadArrays) ||
    function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
        return r;
    };
exports.__esModule = true;
exports.fromLocaleDigit = exports.toLocaleOrdinal = exports.toLocaleDigit = void 0;
var Localize = require('./Localize');
var memoize_1 = require('./memoize');
var NumberFormatUtils = require('./NumberFormatUtils');
var STANDARD_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-', ','];
var INDEX_DECIMAL = 10;
var INDEX_MINUS_SIGN = 11;
var INDEX_GROUP = 12;
var getLocaleDigits = memoize_1['default'](
    function (locale) {
        var localeDigits = __spreadArrays(STANDARD_DIGITS);
        for (var i = 0; i <= 9; i++) {
            localeDigits[i] = NumberFormatUtils.format(locale, i);
        }
        NumberFormatUtils.formatToParts(locale, 1000000.5).forEach(function (part) {
            switch (part.type) {
                case 'decimal':
                    localeDigits[INDEX_DECIMAL] = part.value;
                    break;
                case 'minusSign':
                    localeDigits[INDEX_MINUS_SIGN] = part.value;
                    break;
                case 'group':
                    localeDigits[INDEX_GROUP] = part.value;
                    break;
                default:
                    break;
            }
        });
        return localeDigits;
    },
    {monitoringName: 'getLocaleDigits'},
);
/**
 * Gets the locale digit corresponding to a standard digit.
 *
 * @param digit - Character of a single standard digit . It may be "0" ~ "9" (digits),
 * "," (group separator), "." (decimal separator) or "-" (minus sign).
 *
 * @throws If `digit` is not a valid standard digit.
 */
function toLocaleDigit(locale, digit) {
    var _a;
    var index = STANDARD_DIGITS.indexOf(digit);
    if (index < 0) {
        throw new Error('"' + digit + '" must be in ' + JSON.stringify(STANDARD_DIGITS));
    }
    return (_a = getLocaleDigits(locale).at(index)) !== null && _a !== void 0 ? _a : '';
}
exports.toLocaleDigit = toLocaleDigit;
/**
 * Gets the standard digit corresponding to a locale digit.
 *
 * @param localeDigit - Character of a single locale digit. It may be **the localized version** of
 * "0" ~ "9" (digits), "," (group separator), "." (decimal separator) or "-" (minus sign).
 *
 * @throws If `localeDigit` is not a valid locale digit.
 */
function fromLocaleDigit(locale, localeDigit) {
    var _a;
    var index = getLocaleDigits(locale).indexOf(localeDigit);
    if (index < 0) {
        throw new Error('"' + localeDigit + '" must be in ' + JSON.stringify(getLocaleDigits(locale)));
    }
    return (_a = STANDARD_DIGITS.at(index)) !== null && _a !== void 0 ? _a : '';
}
exports.fromLocaleDigit = fromLocaleDigit;
/**
 * Formats a number into its localized ordinal representation i.e 1st, 2nd etc
 * @param locale - The locale to use for formatting
 * @param number - The number to format
 * @param writtenOrdinals - If true, returns the written ordinal (e.g. "first", "second") for numbers 1-10
 */
function toLocaleOrdinal(locale, number, writtenOrdinals) {
    if (writtenOrdinals === void 0) {
        writtenOrdinals = false;
    }
    // Defaults to "other" suffix or "th" in English
    var suffixKey = 'workflowsPage.frequencies.ordinals.other';
    // Calculate last digit of the number to determine basic ordinality
    var lastDigit = number % 10;
    // Calculate last two digits to handle exceptions in the 11-13 range
    var lastTwoDigits = number % 100;
    if (writtenOrdinals && number >= 1 && number <= 10) {
        return Localize.translate(locale, 'workflowsPage.frequencies.ordinals.' + number);
    }
    if (lastDigit === 1 && lastTwoDigits !== 11) {
        suffixKey = 'workflowsPage.frequencies.ordinals.one';
    } else if (lastDigit === 2 && lastTwoDigits !== 12) {
        suffixKey = 'workflowsPage.frequencies.ordinals.two';
    } else if (lastDigit === 3 && lastTwoDigits !== 13) {
        suffixKey = 'workflowsPage.frequencies.ordinals.few';
    }
    var suffix = Localize.translate(locale, suffixKey);
    return '' + number + suffix;
}
exports.toLocaleOrdinal = toLocaleOrdinal;
