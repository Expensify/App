// we only need polyfills for Mobile.
import '@formatjs/intl-getcanonicallocales/polyfill';
import '@formatjs/intl-locale/polyfill';
import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-numberformat/polyfill';

// Load en & es Locale data
import '@formatjs/intl-numberformat/locale-data/en';
import '@formatjs/intl-numberformat/locale-data/es';

function format(locale, number, options) {
    return new Intl.NumberFormat(locale, options).format(number);
}

function formatToParts(locale, number, options) {
    return new Intl.NumberFormat(locale, options).formatToParts(number);
}

export {
    format,
    formatToParts,
};
