import lodashGet from 'lodash/get';
import loadashTrim from 'lodash/trim';
import loadashTrimStart from 'lodash/trimStart';
import loadashToString from 'lodash/toString';
import loadashIncludes from 'lodash/includes';
import loadashStartsWith from 'lodash/startsWith';
import loadashPadStart from 'lodash/padStart';
import Log from './Log';
import Config from '../CONFIG';
import translations from '../languages/translations';

function showErrorAndReturn(locale) {
    // When a locale is entered which is not available, on production log an alert to server

    if (Config.IS_IN_PRODUCTION) {
        Log.alert(`${locale} was not found.`, 0, {}, false);
    }

    return `${locale} was not found.`;
}

/**
 * Returns a locally converted phone number without the country code
 *
 * @param {String} locale eg 'en', 'es-ES'
 * @param {String|Array} number
 * @returns {string}
 */
function toLocalPhone(locale, number) {
    const numString = loadashTrim(loadashToString(number));

    let withoutPlusNum;

    if (loadashIncludes(numString, '+')) {
        withoutPlusNum = loadashTrimStart(numString, '+');
    } else {
        withoutPlusNum = numString;
    }

    const fullLocale = lodashGet(translations, locale, {});
    const phoneCountryCode = fullLocale.phoneCountryCode;

    if (phoneCountryCode) {
        if (loadashStartsWith(withoutPlusNum, phoneCountryCode)) {
            return loadashTrimStart(withoutPlusNum, phoneCountryCode);
        }
        return numString;
    }
    return showErrorAndReturn(locale);
}

/**
 * Returns an internationally converted phone number with the country code
 *
 * @param {String} locale eg 'en', 'es-ES'
 * @param {String|Array} number
 * @returns {string}
 */
function fromLocalPhone(locale, number) {
    const numString = loadashTrim(loadashToString(number));
    let withoutPlusNum;

    if (loadashIncludes(numString, '+')) {
        withoutPlusNum = loadashTrimStart(numString, '+');
    } else {
        withoutPlusNum = numString;
    }

    const fullLocale = lodashGet(translations, locale, {});
    const phoneCountryCode = fullLocale.phoneCountryCode;

    let paddedConCode = '';

    if (phoneCountryCode) {
        paddedConCode = loadashPadStart(phoneCountryCode, phoneCountryCode.length + 1, '+');
    }

    if (phoneCountryCode) {
        if (loadashStartsWith(withoutPlusNum, phoneCountryCode)) {
            return loadashPadStart(withoutPlusNum, withoutPlusNum.length + 1, '+');
        }
        return loadashPadStart(withoutPlusNum, paddedConCode.length + withoutPlusNum.length, paddedConCode);
    }
    return showErrorAndReturn(locale);
}

export {
    toLocalPhone,
    fromLocalPhone,
};
