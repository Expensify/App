import _ from 'underscore';
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
 *
 * @param {String} phone
 * @return {String}
 */
function getPhoneNumberWithoutSpecialChars(phone) {
    return phone.replace(CONST.REGEX.SPECIAL_CHARS_WITHOUT_NEWLINE, '');
}

/**
 * Remove +1 and special chars from the phone number
 *
 * @param {String} phone
 * @return {String}
 */
function getPhoneNumberWithoutUSCountryCodeAndSpecialChars(phone) {
    return getPhoneNumberWithoutSpecialChars(phone.replace(/^\+1/, ''));
}

/**
 * Converts a login list to an object, where the login partnerUserID is the key
 *
 * TODO: remove this once the server is always sending back the correct format!
 * https://github.com/Expensify/App/issues/10960
 *
 * @param {Array|Object} loginList 
 */
function convertLoginListToObject(loginList = {}) {
    if (!_.isArray(loginList)) {
        return loginList;
    }

    return _.reduce(response.loginList, (allLogins, login) => {
        allLogins[login.partnerUserID] = login;
        return allLogins;
    }, {});
}

export {
    getEmailWithoutMergedAccountPrefix,
    getPhoneNumberWithoutSpecialChars,
    getPhoneNumberWithoutUSCountryCodeAndSpecialChars,
    convertLoginListToObject,
};
