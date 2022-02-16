import CONST from '../CONST';

/**
 * Remove the special chars from the phone number
 * @param {String} phone
 * @return {String}
 */
function getPhoneNumberWithoutSpecialChars(phone) {
    return phone.replace(CONST.REGEX.SPECIAL_CHARS_WITHOUT_NEWLINE, '');
}

/**
 * Remove +1 from the phone number
 * @param {String} phone
 * @return {String}
 */
function getPhoneNumberWithoutUSCountryCode(phone) {
    return phone.replace(/^\+1/, '');
}

export default {
    getPhoneNumberWithoutSpecialChars,
    getPhoneNumberWithoutUSCountryCode,
};
