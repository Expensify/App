import polyfillNumberFormat from './polyfillNumberFormat';
import type IntlPolyfill from './types';

/**
 * Polyfill the Intl API if the ICU version is old.
 * This ensures that the currency data is consistent across platforms and browsers.
 */
const intlPolyfill: IntlPolyfill = () => {
    polyfillNumberFormat();
};
export default intlPolyfill;
