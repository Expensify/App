import polyfillNumberFormat from './polyfillNumberFormat';

/**
 * Polyfill the Intl API if the ICU version is old.
 * This ensures that the currency data is consistent across platforms and browsers.
 */
export default function intlPolyfill() {
    // Just need to polyfill Intl.NumberFormat for web based platforms
    polyfillNumberFormat();
}
