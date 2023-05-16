import Onyx from 'react-native-onyx';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';

let countryCodeByIP;
Onyx.connect({
    key: ONYXKEYS.COUNTRY_CODE,
    callback: (val) => (countryCodeByIP = val || 1),
});

/**
 * Remove the special chars from the phone number
 *
 * @param {String} phone
 * @return {String}
 */
function getPhoneNumberWithoutSpecialChars(phone) {
    return phone.replace(CONST.REGEX.SPECIAL_CHARS_WITHOUT_NEWLINE, '');
}

/**
 * Append user country code to the phone number
 *
 * @param {String} phone
 * @return {String}
 */
function appendCountryCode(phone) {
    return phone.startsWith('+') ? phone : `+${countryCodeByIP}${phone}`;
}

export {getPhoneNumberWithoutSpecialChars, appendCountryCode};
