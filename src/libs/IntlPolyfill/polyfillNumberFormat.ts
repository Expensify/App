import CONST from '@src/CONST';

const numberFormat = new Intl.NumberFormat(CONST.LOCALES.DEFAULT, {
    style: CONST.POLYFILL_TEST.STYLE,
    currency: CONST.POLYFILL_TEST.CURRENCY,
    currencyDisplay: CONST.POLYFILL_TEST.FORMAT,
});

/**
 * Check if the locale data is as expected on the device.
 * Ensures that the currency data is consistent across devices.
 */
function hasOldCurrencyData(): boolean {
    return numberFormat.format(Number(CONST.POLYFILL_TEST.SAMPLE_INPUT)) !== CONST.POLYFILL_TEST.EXPECTED_OUTPUT;
}

/**
 * Checks if the formatToParts function is available on the
 * Intl.NumberFormat object.
 */
function hasFormatToParts(): boolean {
    return typeof numberFormat.formatToParts === 'function';
}

export default function () {
    if (Intl && 'NumberFormat' in Intl && !hasOldCurrencyData() && hasFormatToParts()) {
        return;
    }

    require('@formatjs/intl-numberformat/polyfill-force');

    // Load en & es Locale data
    require('@formatjs/intl-numberformat/locale-data/en');
    require('@formatjs/intl-numberformat/locale-data/es');
}
