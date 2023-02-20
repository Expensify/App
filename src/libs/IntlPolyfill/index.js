import shouldPolyfill from './shouldPolyfill';

/**
 * Polyfill the Intl API if the ICU version is old.
 * This ensures that the currency data is consistent across platforms and browsers.
 */
export default function intlPolyfill() {
    if (!shouldPolyfill()) {
        return;
    }

    // Just need to polyfill Intl.NumberFormat for web based platforms
    require('@formatjs/intl-numberformat/polyfill-force');

    // Load en & es Locale data
    require('@formatjs/intl-numberformat/locale-data/en');
    require('@formatjs/intl-numberformat/locale-data/es');
}
