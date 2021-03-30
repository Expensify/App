import lodashGet from 'lodash/get';
import loadashTrim from 'lodash/trim';
import loadashIncludes from 'lodash/includes';
import loadashStartsWith from 'lodash/startsWith';
import loadashPadStart from 'lodash/padStart';
import Str from 'expensify-common/lib/str';
import translations from '../languages/translations';

/**
 * Returns a locally converted phone number without the country code
 *
 * @param {String} locale eg 'en', 'es-ES'
 * @param {String} number
 * @returns {string}
 */
function toLocalPhone(locale, number) {
    const numString = loadashTrim(number);
    const withoutPlusNum = loadashIncludes(numString, '+') ? Str.cutBefore(numString, '+') : numString;
    const country = lodashGet(translations, [locale, 'phoneCountryCode']);

    if (country) {
        if (loadashStartsWith(withoutPlusNum, country)) {
            return Str.cutBefore(withoutPlusNum, country);
        }
        return numString;
    }
    return number;
}

/**
 * Returns an internationally converted phone number with the country code
 *
 * @param {String} locale eg 'en', 'es-ES'
 * @param {String} number
 * @returns {string}
 */
function fromLocalPhone(locale, number) {
    const numString = loadashTrim(number);
    const withoutPlusNum = loadashIncludes(numString, '+') ? Str.cutBefore(numString, '+') : numString;
    const country = lodashGet(translations, [locale, 'phoneCountryCode']);

    if (country) {
        if (loadashStartsWith(withoutPlusNum, country)) {
            return loadashPadStart(withoutPlusNum, withoutPlusNum.length + 1, '+');
        }
        return loadashPadStart(withoutPlusNum, `+${country}`.length + withoutPlusNum.length, `+${country}`);
    }
    return number;
}

export {
    toLocalPhone,
    fromLocalPhone,
};
