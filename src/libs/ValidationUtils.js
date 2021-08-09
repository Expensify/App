import moment from 'moment';
import CONST from '../CONST';
import Growl from './Growl';
import {translateLocal} from './translate';
import {showBankAccountFormValidationError} from './actions/BankAccounts';

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
 * @param {Object} identity
 * @returns {Boolean}
 */
function isValidIdentity(identity) {
    if (!isValidAddress(identity.street)) {
        showBankAccountFormValidationError(translateLocal('bankAccount.error.address'));
        return false;
    }

    if (identity.state === '') {
        showBankAccountFormValidationError(translateLocal('bankAccount.error.addressState'));
        return false;
    }

    if (!isValidZipCode(identity.zipCode)) {
        showBankAccountFormValidationError(translateLocal('bankAccount.error.zipCode'));
        return false;
    }

    if (!isValidDate(identity.dob)) {
        showBankAccountFormValidationError(translateLocal('bankAccount.error.dob'));
        return false;
    }

    if (!isValidSSNLastFour(identity.ssnLast4)) {
        showBankAccountFormValidationError(translateLocal('bankAccount.error.ssnLast4'));
        return false;
    }

    return true;
}

export {
    isValidAddress,
    isValidDate,
    isValidIndustryCode,
    isValidIdentity,
    isValidZipCode,
    isSingleEmoji,
};
