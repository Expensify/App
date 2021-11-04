import moment from 'moment';
import _ from 'underscore';
import CONST from '../CONST';
import {getMonthFromExpirationDateString, getYearFromExpirationDateString} from './CardUtils';

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
    if (!date) {
        return false;
    }

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
 * Validates that this is a valid expiration date. Supports the following formats:
 * 1. MM/YY
 * 2. MM/YYYY
 * 3. MMYY
 * 4. MMYYYY
 *
 * @param {String} string
 * @returns {Boolean}
 */
function isValidExpirationDate(string) {
    if (!CONST.REGEX.CARD_EXPIRATION_DATE.test(string)) {
        return false;
    }

    // Use the last of the month to check if the expiration date is in the future or not
    const expirationDate = `${getYearFromExpirationDateString(string)}-${getMonthFromExpirationDateString(string)}-01`;
    return moment(expirationDate).endOf('month').isAfter(moment());
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
 * @param {String} paypalUsername
 * @returns {Boolean}
 */
function isValidPaypalUsername(paypalUsername) {
    return Boolean(paypalUsername) && CONST.REGEX.PAYPAL_ME_USERNAME.test(paypalUsername);
}

/**
 * Validate that "date" is between 18 and 150 years in the past
 *
 * @param {String} date
 * @returns {Boolean}
 */
function meetsAgeRequirements(date) {
    const eighteenYearsAgo = moment().subtract(18, 'years');
    const oneHundredFiftyYearsAgo = moment().subtract(150, 'years');
    const testDate = moment(date);
    return testDate.isValid() && testDate.isBetween(oneHundredFiftyYearsAgo, eighteenYearsAgo);
}

/**
 *
 * @param {String} phoneNumber
 * @returns {Boolean}
 */
function isValidPhoneWithSpecialChars(phoneNumber) {
    return CONST.REGEX.PHONE_WITH_SPECIAL_CHARS.test(phoneNumber) && phoneNumber.length <= CONST.PHONE_MAX_LENGTH && phoneNumber.length >= CONST.PHONE_MIN_LENGTH;
}

/**
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
    const requiredFields = ['firstName', 'lastName', 'street', 'city', 'zipCode', 'state', 'ssnLast4', 'dob'];
    const errors = {};

    // Check that all required fields are filled
    _.each(requiredFields, (fieldName) => {
        if (isRequiredFulfilled(identity[fieldName])) {
            return;
        }
        errors[fieldName] = true;
    });

    if (!isValidAddress(identity.street)) {
        errors.street = true;
    }

    if (!isValidZipCode(identity.zipCode)) {
        errors.zipCode = true;
    }

    // dob field has multiple validations/errors, we are handling it temporarily like this.
    if (!isValidDate(identity.dob)) {
        errors.dob = true;
    } else if (!meetsAgeRequirements(identity.dob)) {
        errors.dobAge = true;
    }

    if (!isValidSSNLastFour(identity.ssnLast4)) {
        errors.ssnLast4 = true;
    }

    return errors;
}

/**
 * @param {String} phoneNumber
 * @returns {Boolean}
 */
function isValidUSPhone(phoneNumber) {
    // Remove alphanumeric characters and validate that this is in fact a phone number
    return CONST.REGEX.PHONE_E164_PLUS.test(phoneNumber.replace(CONST.REGEX.NON_ALPHA_NUMERIC, '')) && CONST.REGEX.US_PHONE.test(phoneNumber);
}

/**
 * Checks whether a value is a numeric string including `(`, `)`, `-` and optional leading `+`
 * @param {String} input
 * @returns {Boolean}
 */
function isNumericWithSpecialChars(input) {
    return /^\+?\d*$/.test(input.replace(/[()-]/g, ''));
}

/**
 * Checks whether a given first or last name is valid length
 * @param {String} name
 * @returns {Boolean}
 */
function isValidLengthForFirstOrLastName(name) {
    return name.length <= 50;
}

export {
    meetsAgeRequirements,
    isValidAddress,
    isValidDate,
    isValidSecurityCode,
    isValidExpirationDate,
    isValidDebitCard,
    isValidIndustryCode,
    isValidZipCode,
    isRequiredFulfilled,
    isValidPhoneWithSpecialChars,
    isValidUSPhone,
    isValidURL,
    validateIdentity,
    isNumericWithSpecialChars,
    isValidLengthForFirstOrLastName,
    isValidPaypalUsername,
};
