import _ from 'underscore';
import CONST from '../CONST';

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
 * Filter out all non-Expensify partners from login list
 *
 * @param {Object} loginList
 * @returns {Object}
 */
function keepExpensifyPartners(loginList = {}) {
    return _.pick(loginList, login => login.partnerName === CONST.EXPENSIFY_PARTNER_NAME);
}

/**
 * Cleans login list that came from the server by only keeping logins with Expensify partner name
 *
 * @param {Object} loginList
 * @returns {Object}
 */
function cleanLoginListServerResponse(loginList = {}) {
    return keepExpensifyPartners(loginList);
}

export {
    getPhoneNumberWithoutSpecialChars,
    getPhoneNumberWithoutUSCountryCodeAndSpecialChars,
    cleanLoginListServerResponse,
};
