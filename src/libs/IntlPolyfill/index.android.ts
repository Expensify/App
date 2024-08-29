import polyfillListFormat from './polyfillListFormat';
import type IntlPolyfill from './types';

/**
 * Polyfill the Intl API, always performed for native devices.
 */
const intlPolyfill: IntlPolyfill = () => {
    // Native devices require extra polyfills which are
    // not yet implemented in hermes.
    // see support: https://hermesengine.dev/docs/intl/

    require('@formatjs/intl-locale/polyfill-force');

    polyfillListFormat();
};

export default intlPolyfill;
