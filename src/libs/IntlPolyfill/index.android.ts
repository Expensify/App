import type IntlPolyfill from './types';

import polyfillListFormat from './polyfillListFormat';

/**
 * Polyfill the Intl API, always performed for native devices.
 */
const intlPolyfill: IntlPolyfill = () => {
    // Native devices require extra polyfills which are
    // not yet implemented in hermes.
    // see support: https://hermesengine.dev/docs/intl/

    require('@formatjs/intl-locale/polyfill-force');

    require('@formatjs/intl-pluralrules/polyfill-force');
    // Load en Locale data for safety fallback
    require('@formatjs/intl-pluralrules/locale-data/en');

    polyfillListFormat();
};

export default intlPolyfill;
