import CONST from '../../CONST';

/**
 * Check if the locale data is as expected on the device.
 * Ensures that the currency data is consistent across devices.
 * @returns {Boolean}
 */
function oldCurrencyData() {
    return (
        new Intl.NumberFormat(CONST.DEFAULT_LOCALE, {
            style: CONST.POLYFILL_TEST.STYLE,
            currency: CONST.POLYFILL_TEST.CURRENCY,
            currencyDisplay: CONST.POLYFILL_TEST.FORMAT,
        }).format(CONST.POLYFILL_TEST.SAMPLE_INPUT) !== CONST.POLYFILL_TEST.EXPECTED_OUTPUT
    );
}

/**
 * Check for the existence of the Intl API and ensure results will
 * be as expected.
 * @returns {Boolean}
 */
export default function shouldPolyfill() {
    return (
        typeof Intl === 'undefined'
        || !('NumberFormat' in Intl)
        || oldCurrencyData()
    );
}
