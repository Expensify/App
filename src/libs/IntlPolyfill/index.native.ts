import polyfillNumberFormat from './polyfillNumberFormat';
import polyfillListFormat from './polyfillListFormat';
import IntlPolyfill from './types';

/**
 * Polyfill the Intl API, always performed for native devices.
 */
const intlPolyfill: IntlPolyfill = () => {
    // Native devices require extra polyfills
    require('@formatjs/intl-getcanonicallocales/polyfill');
    require('@formatjs/intl-locale/polyfill');
    require('@formatjs/intl-pluralrules/polyfill');
    require('@formatjs/intl-datetimeformat');
    polyfillNumberFormat();
    polyfillListFormat();
};

export default intlPolyfill;
