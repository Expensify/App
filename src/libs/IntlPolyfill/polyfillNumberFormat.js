import CONST from '../../CONST';

/**
 * Check if the locale data is as expected on the device.
 * Ensures that the currency data is consistent across devices.
 * @returns {Boolean}
 */
function hasOldCurrencyData() {
    return (
        new Intl.NumberFormat(CONST.LOCALES.DEFAULT, {
            style: CONST.POLYFILL_TEST.STYLE,
            currency: CONST.POLYFILL_TEST.CURRENCY,
            currencyDisplay: CONST.POLYFILL_TEST.FORMAT,
        }).format(CONST.POLYFILL_TEST.SAMPLE_INPUT) !== CONST.POLYFILL_TEST.EXPECTED_OUTPUT
    );
}

export default function () {
    if (Intl && 'NumberFormat' in Intl && !hasOldCurrencyData()) {
        return;
    }

    require('@formatjs/intl-numberformat/polyfill-force');

    // Load en & es Locale data
    require('@formatjs/intl-numberformat/locale-data/en');
    require('@formatjs/intl-numberformat/locale-data/es');
}
