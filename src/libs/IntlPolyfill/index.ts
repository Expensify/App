import polyfillDateTimeFormat from '@libs/IntlPolyfill/polyfillDateTimeFormat';
import polyfillNumberFormat from '@libs/IntlPolyfill/polyfillNumberFormat';
import IntlPolyfill from './types';

/**
 * Polyfill the Intl API if the ICU version is old.
 * This ensures that the currency data is consistent across platforms and browsers.
 */
const intlPolyfill: IntlPolyfill = () => {
    polyfillNumberFormat();
    polyfillDateTimeFormat();
};
export default intlPolyfill;
