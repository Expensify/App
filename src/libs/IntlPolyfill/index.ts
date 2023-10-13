import polyfillNumberFormat from './polyfillNumberFormat';
import IntlPolyfill from './types';
import polyfillDateTimeFormat from './polyfillDateTimeFormat';

/**
 * Polyfill the Intl API if the ICU version is old.
 * This ensures that the currency data is consistent across platforms and browsers.
 */
const intlPolyfill: IntlPolyfill = () => {
    polyfillNumberFormat();
    polyfillDateTimeFormat();
};
export default intlPolyfill;
