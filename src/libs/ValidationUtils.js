import moment from 'moment';
import _ from 'underscore';
import CONST from '../CONST';
import {showBankAccountFormValidationError, showBankAccountErrorModal} from './actions/BankAccounts';
import {translateLocal} from './translate';


/**
 * Implements the Luhn Algorithm, a checksum formula used to validate credit card
 * numbers.
 *
 * @param {String} val
 * @returns {Boolean}
 */
function validateCardNumber(val) {
    let sum = 0;
    for (let i = 0; i < val.length; i++) {
        let intVal = parseInt(val.substr(i, 1), 10);
        if (i % 2 === 0) {
            intVal *= 2;
            if (intVal > 9) {
                intVal = 1 + (intVal % 10);
            }
        }
        sum += intVal;
    }
    return (sum % 10) === 0;
}

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
 * Used to validate a value that is "required".
 *
 * @param {*} value
 * @returns {Boolean}
 */
function isRequiredFulfilled(value) {
    if (_.isString(value)) {
        return !_.isEmpty(value.trim());
    }
    if (_.isArray(value) || _.isObject(value)) {
        return !_.isEmpty(value);
    }
    return Boolean(value);
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
 * Validates that this is a valid expiration date
 * in the MM/YY or MM/YYYY format
 *
 * @param {String} string
 * @returns {Boolean}
 */
function isValidExpirationDate(string) {
    return CONST.REGEX.CARD_EXPIRATION_DATE.test(string);
}

/**
 * Validates that this is a valid security code
 * in the XXX or XXXX format.
 *
 * @param {String} string
 * @returns {Boolean}
 */
function isValidSecurityCode(string) {
    return CONST.REGEX.CARD_SECURITY_CODE.test(string);
}

/**
 * Validates a debit card number (15 or 16 digits).
 *
 * @param {String} string
 * @returns {Boolean}
 */
function isValidDebitCard(string) {
    if (!CONST.REGEX.CARD_NUMBER.test(string)) {
        return false;
    }

    return validateCardNumber(string);
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
 *
 * @param {String} date
 * @returns {Boolean}
 */
function isValidAge(date) {
    return moment().diff(moment(date), 'years') >= 18;
}

/**
 * @param {Object} identity
 * @returns {Boolean}
 */
function isValidIdentity(identity) {
    if (!isValidAddress(identity.street)) {
        showBankAccountFormValidationError(translateLocal('bankAccount.error.address'));
        showBankAccountErrorModal();
        return false;
    }

    if (identity.state === '') {
        showBankAccountFormValidationError(translateLocal('bankAccount.error.addressState'));
        showBankAccountErrorModal();
        return false;
    }

    if (!isValidZipCode(identity.zipCode)) {
        showBankAccountFormValidationError(translateLocal('bankAccount.error.zipCode'));
        showBankAccountErrorModal();
        return false;
    }

    if (!isValidDate(identity.dob)) {
        showBankAccountFormValidationError(translateLocal('bankAccount.error.dob'));
        showBankAccountErrorModal();
        return false;
    }

    if (!isValidAge(identity.dob)) {
        showBankAccountFormValidationError(translateLocal('bankAccount.error.age'));
        showBankAccountErrorModal();
        return false;
    }

    if (!isValidSSNLastFour(identity.ssnLast4)) {
        showBankAccountFormValidationError(translateLocal('bankAccount.error.ssnLast4'));
        showBankAccountErrorModal();
        return false;
    }

    return true;
}

export {
    isValidAddress,
    isValidDate,
    isValidSecurityCode,
    isValidExpirationDate,
    isValidDebitCard,
    isValidIndustryCode,
    isValidIdentity,
    isValidZipCode,
    isRequiredFulfilled,
};
