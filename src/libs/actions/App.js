import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {String} url
 */
function setCurrentURL(url) {
    Onyx.set(ONYXKEYS.CURRENT_URL, url);
}

/**
 * @param {String} locale
 */
function setLocale(locale) {
    Onyx.set(ONYXKEYS.PREFERRED_LOCALE, locale);
}

export {
    setCurrentURL,
    setLocale,
};
