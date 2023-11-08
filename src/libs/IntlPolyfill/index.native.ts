import polyfillDateTimeFormat from '@libs/IntlPolyfill/polyfillDateTimeFormat';
import polyfillListFormat from './polyfillListFormat';
import polyfillNumberFormat from './polyfillNumberFormat';
import IntlPolyfill from './types';

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
