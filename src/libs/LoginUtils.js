import CONST from '../CONST';

/**
 * Remove the MERGED_0@ prefix from merged account emails.
 *
 * @param {String} email
 * @returns {String}
 */
function getEmailWithoutMergedAccountPrefix(email) {
    return email.replace(/^MERGED_0@/, '');
}

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

export {
    getEmailWithoutMergedAccountPrefix,
    getPhoneNumberWithoutSpecialChars,
    getPhoneNumberWithoutUSCountryCode,
};
