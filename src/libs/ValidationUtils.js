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
 * Validate date fields
 *
 * @param {String|Date} date
 * @returns {Boolean} true if valid
 */
function isValidDate(date) {
    const pastDate = moment().subtract(1000, 'years');
    const futureDate = moment().add(1000, 'years');
    const testDate = moment(date);
    return testDate.isValid() && testDate.isBetween(pastDate, futureDate);
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
    if (_.isDate(value)) {
        return isValidDate(value);
    }
    if (_.isArray(value) || _.isObject(value)) {
        return !_.isEmpty(value);
    }
    return Boolean(value);
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
 * @param {String} date
 * @returns {Boolean}
 */
function isValidAge(date) {
    const eighteenYearsAgo = moment().subtract(18, 'years');
    const oneHundredFiftyYearsAgo = moment().subtract(150, 'years');
    const testDate = moment(date);
    return testDate.isValid() && testDate.isBetween(oneHundredFiftyYearsAgo, eighteenYearsAgo);
}

/**
 *
 * @param {String} url
 * @returns {Boolean}
 */
function isValidURL(url) {
    return CONST.REGEX.HYPERLINK.test(url);
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

    if (identity.city === '') {
        showBankAccountFormValidationError(translateLocal('bankAccount.error.addressCity'));
        showBankAccountErrorModal();
        return false;
    }

    if (!isValidZipCode(identity.zipCode)) {
        showBankAccountFormValidationError(translateLocal('bankAccount.error.zipCode'));
        showBankAccountErrorModal();
        return false;
    }

    if (!isValidDate(identity.dob) || !isValidAge(identity.dob)) {
        showBankAccountFormValidationError(translateLocal('bankAccount.error.dob'));
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

/**
 * @param {String} phoneNumber
 * @returns {Boolean}
 */
function isValidUSPhone(phoneNumber) {
    // Remove alphanumeric characters and validate that this is in fact a phone number
    return CONST.REGEX.PHONE_E164_PLUS.test(phoneNumber.replace(CONST.REGEX.NON_ALPHA_NUMERIC, '')) && CONST.REGEX.US_PHONE.test(phoneNumber);
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
    isValidUSPhone,
    isValidURL,
};
