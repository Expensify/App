import CONST from '../CONST';

/**
 * Remove the special chars from the phone number
 * @param {String} phone
 * @return {String}
 */
function getPhoneNumberWithoutSpecialChars(phone) {
    return phone.replace(CONST.REGEX.SPECIAL_CHARS_WITHOUT_NEWLINE, '');
}

export default {
    getPhoneNumberWithoutSpecialChars,
};
