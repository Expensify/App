import shouldPolyfill from './shouldPolyfill';
import polyfillNumberFormat from './polyfillNumberFormat';

/**
 * Polyfill the Intl API, always performed for native devices.
 */
export default function polyfill() {
    if (!shouldPolyfill()) {
        return;
    }

    // Native devices require extra polyfills
    require('@formatjs/intl-getcanonicallocales/polyfill');
    require('@formatjs/intl-locale/polyfill');
    require('@formatjs/intl-pluralrules/polyfill');
    polyfillNumberFormat();
}
