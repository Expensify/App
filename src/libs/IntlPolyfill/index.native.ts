import polyfillNumberFormat from './polyfillNumberFormat';
import polyfillListFormat from './polyfillListFormat';
import IntlPolyfill from './types';
import polyfillDateTimeFormat from './polyfillDateTimeFormat';

/**
 * Polyfill the Intl API, always performed for native devices.
 */
const intlPolyfill: IntlPolyfill = () => {
    // Native devices require extra polyfills
    require('@formatjs/intl-getcanonicallocales/polyfill');
    require('@formatjs/intl-locale/polyfill');
    require('@formatjs/intl-pluralrules/polyfill');
    polyfillNumberFormat();
    polyfillDateTimeFormat();
    polyfillListFormat();
};

export default intlPolyfill;
