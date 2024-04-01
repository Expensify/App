import polyfillDateTimeFormat from './polyfillDateTimeFormat';
import polyfillListFormat from './polyfillListFormat';
import polyfillNumberFormat from './polyfillNumberFormat';
import type IntlPolyfill from './types';

/**
 * Polyfill the Intl API, always performed for native devices.
 */
const intlPolyfill: IntlPolyfill = () => {
    // Native devices require extra polyfills which are
    // not yet implemented in hermes.
    // see support: https://hermesengine.dev/docs/intl/

    require('@formatjs/intl-locale/polyfill');

    // Required to polyfill NumberFormat on iOS
    // see: https://github.com/facebook/hermes/issues/1172#issuecomment-1776156538
    require('@formatjs/intl-pluralrules/polyfill');
    polyfillNumberFormat();

    // Required to polyfill DateTimeFormat on iOS
    // see: https://github.com/facebook/hermes/issues/1172#issuecomment-1776156538
    polyfillDateTimeFormat();

    polyfillListFormat();
};

export default intlPolyfill;
