import moment from 'moment';
import CONST from '../CONST';
import {translateLocal} from './translate';

/**
 * Validating that this is a valid address (PO boxes are not allowed)
 *
 * @param {String} value
 * @returns {Boolean}
 */
function isValidAddress(value) {
    if (!CONST.REGEX.ANY_VALUE.test(value)) {
        return false;
    }

    return !CONST.REGEX.PO_BOX.test(value);
}

/**
 * Validates that this string is composed of a single emoji
 *
 * @param {String} message
 * @returns {Boolean}
 */
function isSingleEmoji(message) {
    const match = message.match(CONST.REGEX.EMOJIS);

    if (!match) {
        return false;
    }

    const matchedEmoji = match[0];
    return message.length === matchedEmoji.length;
}

/**
 * Validate date fields
 *
 * @param {String} date
 * @returns {Boolean} true if valid
 */
function isValidDate(date) {
    return moment(date).isValid();
}

/**
 * @param {String} code
 * @returns {Boolean}
 */
function isValidIndustryCode(code) {
    return CONST.REGEX.INDUSTRY_CODE.test(code);
}

/**
 * @param {String} zipCode
 * @returns {Boolean}
 */
function isValidZipCode(zipCode) {
    return CONST.REGEX.ZIP_CODE.test(zipCode);
}

/**
 * @param {String} ssnLast4
 * @returns {Boolean}
 */
function isValidSSNLastFour(ssnLast4) {
    return CONST.REGEX.SSN_LAST_FOUR.test(ssnLast4);
}

/**
 * Get error translation keys associated with the first invalid field found
 *
 * @param {Object} identity
 * @returns {string|undefined}
 */

function getIdentityError(identity) {
    if (!isValidAddress(identity.street)) {
        return translateLocal('bankAccount.error.address');
    }

    if (identity.state === '') {
        return translateLocal('bankAccount.error.addressState');
    }

    if (!isValidZipCode(identity.zipCode)) {
        return translateLocal('bankAccount.error.zipCode');
    }

    if (!isValidDate(identity.dob)) {
        return translateLocal('bankAccount.error.dob');
    }

    if (!isValidSSNLastFour(identity.ssnLast4)) {
        return translateLocal('bankAccount.error.ssnLast4');
    }
    return undefined;
}

/**
 * @param {Object} identity
 * @returns {Boolean}
 */
function isValidIdentity(identity) {
    return !getIdentityError(identity);
}

export {
    getIdentityError,
    isValidAddress,
    isValidDate,
    isValidIndustryCode,
    isValidIdentity,
    isValidZipCode,
    isSingleEmoji,
};
