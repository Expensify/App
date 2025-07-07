"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var CONST_1 = require("@src/CONST");
var numberFormat = new Intl.NumberFormat(CONST_1.default.LOCALES.DEFAULT, {
    style: CONST_1.default.POLYFILL_TEST.STYLE,
    currency: CONST_1.default.POLYFILL_TEST.CURRENCY,
    currencyDisplay: CONST_1.default.POLYFILL_TEST.FORMAT,
});
/**
 * Check if the locale data is as expected on the device.
 * Ensures that the currency data is consistent across devices.
 */
function hasOldCurrencyData() {
    return numberFormat.format(Number(CONST_1.default.POLYFILL_TEST.SAMPLE_INPUT)) !== CONST_1.default.POLYFILL_TEST.EXPECTED_OUTPUT;
}
/**
 * Checks if the formatToParts function is available on the
 * Intl.NumberFormat object.
 */
function hasFormatToParts() {
    return typeof numberFormat.formatToParts === 'function';
}
function default_1() {
    if (Intl && 'NumberFormat' in Intl && !hasOldCurrencyData() && hasFormatToParts()) {
        return;
    }
    require('@formatjs/intl-numberformat/polyfill-force');
    // Load en & es Locale data
    require('@formatjs/intl-numberformat/locale-data/en');
    require('@formatjs/intl-numberformat/locale-data/es');
}
