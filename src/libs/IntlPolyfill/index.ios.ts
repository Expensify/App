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

    require('@formatjs/intl-locale/polyfill-force');

    require('@formatjs/intl-pluralrules/polyfill-force');
    require('@formatjs/intl-pluralrules/locale-data/en');
    require('@formatjs/intl-pluralrules/locale-data/es');

    // Required to polyfill NumberFormat on iOS
    // see: https://github.com/facebook/hermes/issues/1172#issuecomment-1776156538
    polyfillNumberFormat();

    // Required to polyfill DateTimeFormat on iOS
    // see: https://github.com/facebook/hermes/issues/1172#issuecomment-1776156538

    // Removing polyfill for testing on ad-hoc build, it is the potential cause of the lag when opening the report
    // polyfillDateTimeFormat();

    polyfillListFormat();
};

export default intlPolyfill;
