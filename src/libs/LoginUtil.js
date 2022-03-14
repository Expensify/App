import CONST from '../CONST';

let password;

/**
 * Remove the special chars from the phone number
 * @param {String} phone
 * @return {String}
 */
function getPhoneNumberWithoutSpecialChars(phone) {
    return phone.replace(CONST.REGEX.SPECIAL_CHARS_WITHOUT_NEWLINE, '');
}

/**
 * Set password value
 * @param {String} value
 */
function setPassword(value) {
    password = value;
}

/**
 * Returns password then delete it
 * @return {String}
 */
function getAndDestroyPassword() {
    const currentPassword = password;
    password = null;
    return currentPassword;
}

export default {
    getPhoneNumberWithoutSpecialChars,
    setPassword,
    getAndDestroyPassword,
};
