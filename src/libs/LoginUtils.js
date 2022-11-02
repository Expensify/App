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
 * @return {Object}
 */
function convertLoginListToObject(loginList = {}) {
    if (!_.isArray(loginList)) {
        return loginList;
    }

    return _.reduce(loginList, (allLogins, login) => {
        // eslint-disable-next-line no-param-reassign
        allLogins[login.partnerUserID] = login;
        return allLogins;
    }, {});
}

/**
 * Filter out all non-Expensify partners from login list
 *
 * @param {Object} loginList
 * @returns {Object}
 */
function keepExpensifyPartners(loginList = {}) {
    return _.pick(loginList, login => login.partnerName === CONST.EXPENSIFY_PARTNER_NAME);
}

/**
 * Cleans login list that came from the server by doing two steps:
 * 1. Converts login list to an object (in case it came as an array)
 * 2. Only keeps logins with Expensify partner name
 *
 * @param {Array|Object} loginList
 * @returns {Object}
 */
function cleanLoginListServerResponse(loginList = {}) {
    return keepExpensifyPartners(convertLoginListToObject(loginList));
}

export {
    getEmailWithoutMergedAccountPrefix,
    getPhoneNumberWithoutSpecialChars,
    getPhoneNumberWithoutUSCountryCodeAndSpecialChars,
    convertLoginListToObject,
    cleanLoginListServerResponse,
};
