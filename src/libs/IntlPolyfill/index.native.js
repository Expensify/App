import shouldPolyfill from './shouldPolyfill';

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
    require('@formatjs/intl-numberformat/polyfill-force');

    // Load en & es Locale data
    require('@formatjs/intl-numberformat/locale-data/en');
    require('@formatjs/intl-numberformat/locale-data/es');
}
