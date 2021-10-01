import moment from 'moment';
import _ from 'underscore';
import CONST from '../CONST';


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
 * Validate that "date" is between 18 and 150 years in the past
 *
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
 * @returns {Object}
 */
function validateIdentity(identity) {
    const errors = {};
    if (!isValidAddress(identity.street)) {
        errors.street = true;
    }

    if (!isRequiredFulfilled(identity.state)) {
        errors.state = true;
    }

    if (!isRequiredFulfilled(identity.city)) {
        errors.city = true;
    }

    if (!isValidZipCode(identity.zipCode)) {
        errors.zipCode = true;
    }

    if (!isValidDate(identity.dob)) {
        errors.dob = true;
    } else if (!isValidAge(identity.dob)) {
        errors.dobAge = true;
    }

    if (!isValidSSNLastFour(identity.ssnLast4)) {
        errors.ssnLast4 = true;
    }

    return errors;
}

export {
    isValidAge,
    isValidAddress,
    isValidDate,
    isValidSecurityCode,
    isValidExpirationDate,
    isValidDebitCard,
    isValidIndustryCode,
    isValidZipCode,
    isRequiredFulfilled,
    isValidURL,
    validateIdentity,
};
