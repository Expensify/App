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

/**
 * Returns a locally converted phone number without the country code
 *
 * @param {String} locale eg 'en', 'es-ES'
 * @param {String|Array} number
 * @returns {string}
 */
function toLocalPhone(locale, number) {
    const numString = loadashTrim(loadashToString(number));
    const withoutPlusNum = loadashIncludes(numString, '+') ? loadashTrimStart(numString, '+') : numString;
    const fullLocale = lodashGet(translations, locale, {});
    const phoneCountryCode = fullLocale.phoneCountryCode;

    return phoneCountryCode ?  
        loadashStartsWith(withoutPlusNum, phoneCountryCode) ? 
            loadashTrimStart(withoutPlusNum, phoneCountryCode ) : 
                numString :
                    showErrorAndReturn(locale);;
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
    const withoutPlusNum = loadashIncludes(numString, '+') ? loadashTrimStart(numString, '+') : numString;
    const fullLocale = lodashGet(translations, locale, {});
    const phoneCountryCode = fullLocale.phoneCountryCode;
    const paddedConCode = phoneCountryCode ? loadashPadStart(phoneCountryCode, phoneCountryCode.length + 1, '+') : '';

    return phoneCountryCode ?  
        loadashStartsWith(withoutPlusNum, phoneCountryCode) ? 
            loadashPadStart(withoutPlusNum, withoutPlusNum.length + 1, '+') : 
                loadashPadStart(withoutPlusNum, paddedConCode.length + withoutPlusNum.length, paddedConCode) :
                    showErrorAndReturn(locale);
}

function showErrorAndReturn(locale){
    // When a locale is entered which is not available, on production log an alert to server
    // on development throw an error

    if (Config.IS_IN_PRODUCTION) {
        Log.alert(`${locale} was not found.`, 0, {}, false);
        return `${locale} was not found.`;
    }
    throw new Error(`${locale} was not found.`);
}

export {
    toLocalPhone,
    fromLocalPhone,
};
