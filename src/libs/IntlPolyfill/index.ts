import polyfillNumberFormat from './polyfillNumberFormat';
import IntlPolyfill from './types';

/**
 * Polyfill the Intl API if the ICU version is old.
 * This ensures that the currency data is consistent across platforms and browsers.
 */
const intlPolyfill: IntlPolyfill = () => {
    // Just need to polyfill Intl.NumberFormat for web based platforms
    polyfillNumberFormat();
    require('@formatjs/intl-datetimeformat');
};
export default intlPolyfill;
