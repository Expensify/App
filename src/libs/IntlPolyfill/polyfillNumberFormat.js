/**
 * Common imports that are required for all platforms
 */

function polyfillNumberFormat() {
    require('@formatjs/intl-numberformat/polyfill-force');

    // Load en & es Locale data
    require('@formatjs/intl-numberformat/locale-data/en');
    require('@formatjs/intl-numberformat/locale-data/es');
}

export default polyfillNumberFormat;
