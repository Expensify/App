import polyfillNumberFormat from './polyfillNumberFormat';
import polyfillListFormat from './polyfillListFormat';

/**
 * Polyfill the Intl API, always performed for native devices.
 */
export default function polyfill() {
    // Native devices require extra polyfills
    require('@formatjs/intl-getcanonicallocales/polyfill');
    require('@formatjs/intl-locale/polyfill');
    require('@formatjs/intl-pluralrules/polyfill');
    polyfillNumberFormat();
    polyfillListFormat();
}
