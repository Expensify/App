import CONST from '../CONST';

/**
 * Remove the MERGED_0@ prefix from merged account emails.
 *
 * @param {String} email
 * @returns {String}
 */
function getEmailWithoutMergedAccountPrefix(email) {
    return email.replace(/^MERGED_\d@/, '');
}

/**
 * Remove the special chars from the phone number
 * @param {String} phone
 * @return {String}
 */
function getPhoneNumberWithoutSpecialChars(phone) {
    return phone.replace(CONST.REGEX.SPECIAL_CHARS_WITHOUT_NEWLINE, '');
}

export {
    getEmailWithoutMergedAccountPrefix,
    getPhoneNumberWithoutSpecialChars,
};
