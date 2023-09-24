import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import {PUBLIC_DOMAINS} from 'expensify-common/lib/CONST';
import {parsePhoneNumber} from 'awesome-phonenumber';
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

/**
 * Check email is public domain or not
 *
 * @param {String} email
 * @return {Boolean}
 */
function isEmailPublicDomain(email) {
    const emailDomain = Str.extractEmailDomain(email);
    return _.includes(PUBLIC_DOMAINS, emailDomain.toLowerCase(), false);
}

/**
 * Check if number is valid
 * @param {String} values
 * @returns {String} - Returns valid phone number formatted
 */
function validateNumber(values) {
    const parsedPhoneNumber = parsePhoneNumber(values);

    if (parsedPhoneNumber.possible && Str.isValidPhone(values.slice(0))) {
        return parsedPhoneNumber.number.e164 + CONST.SMS.DOMAIN;
    }

    return '';
}

/**
 * Check number is valid and attach country code
 * @param {String} partnerUserID
 * @returns {String} - Returns valid phone number with country code
 */
function getPhoneLogin(partnerUserID) {
    if (_.isEmpty(partnerUserID)) {
        return '';
    }

    return appendCountryCode(getPhoneNumberWithoutSpecialChars(partnerUserID));
}

export {getPhoneNumberWithoutSpecialChars, appendCountryCode, isEmailPublicDomain, validateNumber, getPhoneLogin};
