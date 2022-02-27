import CONST from '../CONST';


let secret = null;

/**
 * Remove the special chars from the phone number
 * @param {String} phone
 * @return {String}
 */
function getPhoneNumberWithoutSpecialChars(phone) {
    return phone.replace(CONST.REGEX.SPECIAL_CHARS_WITHOUT_NEWLINE, '');
}

function storePassword(value) {
    secret = value;
}

function getAndDestroyPassword() {
    const password = secret;
    secret = null;
    return password;
}

export default {
    getPhoneNumberWithoutSpecialChars,
    storePassword,
    getAndDestroyPassword,
};
