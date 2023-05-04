import lodashGet from 'lodash/get';
import lodashMerge from 'lodash/merge';
import {shouldPolyfill as shouldPolyfillGetCanonicalLocales} from '@formatjs/intl-getcanonicallocales/should-polyfill';
import {shouldPolyfill as shouldPolyfillIntlLocale} from '@formatjs/intl-locale/should-polyfill';
import {shouldPolyfill as shouldPolyfillPluralRules} from '@formatjs/intl-pluralrules/should-polyfill';
import {shouldPolyfill as shouldPolyfillNumberFormat} from '@formatjs/intl-numberformat/should-polyfill';
import {shouldPolyfill as shouldPolyfillListFormat} from '@formatjs/intl-listformat/should-polyfill';
import CONST from '../CONST';
import BaseLocaleListener from './Localize/LocaleListener/BaseLocaleListener';

const polyfills = {};

/**
 * Check if the locale data is as expected on the device.
 * Ensures that the currency data is consistent across devices.
 *
 * @returns {Boolean}
 */
function hasOldCurrencyData() {
    return (
        new Intl.NumberFormat(CONST.LOCALES.DEFAULT, {
            style: CONST.POLYFILL_TEST.STYLE,
            currency: CONST.POLYFILL_TEST.CURRENCY,
            currencyDisplay: CONST.POLYFILL_TEST.FORMAT,
        }).format(CONST.POLYFILL_TEST.SAMPLE_INPUT) !== CONST.POLYFILL_TEST.EXPECTED_OUTPUT
    );
}

/**
 * Polyfill the Intl API if the ICU version if needed
 * This ensures that the currency data is consistent across platforms and browsers.
 *
 * @param {String} locale
 */
function intlPolyfill(locale) {
    if (shouldPolyfillGetCanonicalLocales() && !polyfills[CONST.INTL_POLYFILLS.GET_CANONICAL_LOCALES]) {
        require('@formatjs/intl-getcanonicallocales/polyfill');
        polyfills[CONST.INTL_POLYFILLS.GET_CANONICAL_LOCALES] = true;
    }

    if (shouldPolyfillIntlLocale() && !polyfills[CONST.INTL_POLYFILLS.LOCALE]) {
        require('@formatjs/intl-locale/polyfill');
        polyfills[CONST.INTL_POLYFILLS.LOCALE] = true;
    }

    if (shouldPolyfillPluralRules(locale) && !lodashGet(polyfills, [CONST.INTL_POLYFILLS.PLURAL_RULES, locale], false)) {
        require('@formatjs/intl-pluralrules/polyfill-force');
        require(`@formatjs/intl-pluralrules/locale-data/${locale}`);
        lodashMerge(polyfills, {[CONST.INTL_POLYFILLS.PLURAL_RULES]: {locale: true}});
    }

    if ((shouldPolyfillNumberFormat(locale) || hasOldCurrencyData()) && !lodashGet(polyfills, [CONST.INTL_POLYFILLS.NUMBER_FORMAT, locale], false)) {
        require('@formatjs/intl-numberformat/polyfill-force');
        require(`@formatjs/intl-numberformat/locale-data/${locale}`);
        lodashMerge(polyfills, {[CONST.INTL_POLYFILLS.NUMBER_FORMAT]: {locale: true}});
    }

    if (shouldPolyfillListFormat(locale) && !lodashGet(polyfills, [CONST.INTL_POLYFILLS.LIST_FORMAT, locale], false)) {
        require('@formatjs/intl-listformat/polyfill-force');
        require(`@formatjs/intl-listformat/locale-data/${locale}`);
        lodashMerge(polyfills, {[CONST.INTL_POLYFILLS.LIST_FORMAT]: {locale: true}});
    }
}

export default function init() {
    intlPolyfill(CONST.LOCALES.DEFAULT);
    BaseLocaleListener.connect((locale) => {
        if (!locale) {
            return;
        }
        intlPolyfill(locale);
    });
}
