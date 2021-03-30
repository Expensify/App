import lodashGet from 'lodash/get';
import lodashTrim from 'lodash/trim';
import lodashIncludes from 'lodash/includes';
import lodashStartsWith from 'lodash/startsWith';
import lodashPadStart from 'lodash/padStart';
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
    const numString = lodashTrim(number);
    const withoutPlusNum = lodashIncludes(numString, '+') ? Str.cutBefore(numString, '+') : numString;
    const country = lodashGet(translations, [locale, 'phoneCountryCode']);

    if (country) {
        if (lodashStartsWith(withoutPlusNum, country)) {
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
    const numString = lodashTrim(number);
    const withoutPlusNum = lodashIncludes(numString, '+') ? Str.cutBefore(numString, '+') : numString;
    const country = lodashGet(translations, [locale, 'phoneCountryCode']);

    if (country) {
        if (lodashStartsWith(withoutPlusNum, country)) {
            return lodashPadStart(withoutPlusNum, withoutPlusNum.length + 1, '+');
        }
        return lodashPadStart(withoutPlusNum, `+${country}`.length + withoutPlusNum.length, `+${country}`);
    }
    return number;
}

export {
    toLocalPhone,
    fromLocalPhone,
};
