// we only need polyfills for Mobile.
import '@formatjs/intl-getcanonicallocales/polyfill';
import '@formatjs/intl-locale/polyfill';
import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-numberformat/polyfill';

// Load en Locale data
import '@formatjs/intl-numberformat/locale-data/en';

function numberFormat(locale, number, options) {
    return new Intl.NumberFormat(locale, options).format(number);
}

export default numberFormat;
