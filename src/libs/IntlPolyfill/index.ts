import type IntlPolyfill from './types';

import polyfillNumberFormat from './polyfillNumberFormat';

/**
 * Polyfill the Intl API if the ICU version is old.
 * This ensures that the currency data is consistent across platforms and browsers.
 */
const intlPolyfill: IntlPolyfill = () => {
    polyfillNumberFormat();
};
export default intlPolyfill;
