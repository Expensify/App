import moment from 'moment';
import _ from 'underscore';
import {URL_REGEX_WITH_REQUIRED_PROTOCOL} from 'expensify-common/lib/Url';
import {parsePhoneNumber} from 'awesome-phonenumber';
import CONST from '../CONST';
import * as CardUtils from './CardUtils';
import * as LoginUtils from './LoginUtils';

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
    return sum % 10 === 0;
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
 * Validate that date entered isn't a future date.
 *
 * @param {String|Date} date
 * @returns {Boolean} true if valid
 */
function isValidPastDate(date) {
    if (!date) {
        return false;
    }

    const pastDate = moment().subtract(1000, 'years');
    const currentDate = moment();
    const testDate = moment(date).startOf('day');
    return testDate.isValid() && testDate.isBetween(pastDate, currentDate);
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
    const expirationDate = `${CardUtils.getYearFromExpirationDateString(string)}-${CardUtils.getMonthFromExpirationDateString(string)}-01`;
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
 * @param {String} ssnFull9
 * @returns {Boolean}
 */
function isValidSSNFullNine(ssnFull9) {
    return CONST.REGEX.SSN_FULL_NINE.test(ssnFull9);
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
 * Validate that a date meets the minimum age requirement.
 *
 * @param {String} date
 * @returns {Boolean}
 */
function meetsMinimumAgeRequirement(date) {
    const testDate = moment(date);
    const minDate = moment().subtract(CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT, 'years');
    return testDate.isValid() && testDate.isSameOrBefore(minDate, 'day');
}

/**
 * Validate that a date meets the maximum age requirement.
 *
 * @param {String} date
 * @returns {Boolean}
 */
function meetsMaximumAgeRequirement(date) {
    const testDate = moment(date);
    const maxDate = moment().subtract(CONST.DATE_BIRTH.MAX_AGE, 'years');
    return testDate.isValid() && testDate.isSameOrAfter(maxDate, 'day');
}

/**
 * Validate that given date is in a specified range of years before now.
 *
 * @param {String} date
 * @param {Number} minimumAge
 * @param {Number} maximumAge
 * @returns {String|Array}
 */
function getAgeRequirementError(date, minimumAge, maximumAge) {
    const recentDate = moment().startOf('day').subtract(minimumAge, 'years');
    const longAgoDate = moment().startOf('day').subtract(maximumAge, 'years');
    const testDate = moment(date);
    if (!testDate.isValid()) {
        return 'common.error.dateInvalid';
    }
    if (testDate.isBetween(longAgoDate, recentDate, undefined, '[]')) {
        return '';
    }
    if (testDate.isSameOrAfter(recentDate)) {
        return ['privatePersonalDetails.error.dateShouldBeBefore', {dateString: recentDate.format(CONST.DATE.MOMENT_FORMAT_STRING)}];
    }
    return ['privatePersonalDetails.error.dateShouldBeAfter', {dateString: longAgoDate.format(CONST.DATE.MOMENT_FORMAT_STRING)}];
}

/**
 * Similar to backend, checks whether a website has a valid URL or not.
 * http/https/ftp URL scheme required.
 *
 * @param {String} url
 * @returns {Boolean}
 */
function isValidWebsite(url) {
    return new RegExp(`^${URL_REGEX_WITH_REQUIRED_PROTOCOL}$`, 'i').test(url);
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
    if (!isValidDate(identity.dob) || !meetsMaximumAgeRequirement(identity.dob)) {
        errors.dob = true;
    } else if (!meetsMinimumAgeRequirement(identity.dob)) {
        errors.dobAge = true;
    }

    if (!isValidSSNLastFour(identity.ssnLast4)) {
        errors.ssnLast4 = true;
    }

    return errors;
}

/**
 * @param {String} phoneNumber
 * @param {Boolean} [isCountryCodeOptional]
 * @returns {Boolean}
 */
function isValidUSPhone(phoneNumber = '', isCountryCodeOptional) {
    const phone = phoneNumber || '';
    const regionCode = isCountryCodeOptional ? CONST.COUNTRY.US : null;

    const parsedPhoneNumber = parsePhoneNumber(phone, {regionCode});
    return parsedPhoneNumber.possible && parsedPhoneNumber.regionCode === CONST.COUNTRY.US;
}

/**
 * @param {string} validateCode
 * @returns {Boolean}
 */
function isValidValidateCode(validateCode) {
    return validateCode.match(CONST.VALIDATE_CODE_REGEX_STRING);
}

/**
 * @param {String} code
 * @returns {Boolean}
 */
function isValidTwoFactorCode(code) {
    return Boolean(code.match(CONST.REGEX.CODE_2FA));
}

/**
 * Checks whether a value is a numeric string including `(`, `)`, `-` and optional leading `+`
 * @param {String} input
 * @returns {Boolean}
 */
function isNumericWithSpecialChars(input) {
    return /^\+?\d*$/.test(LoginUtils.getPhoneNumberWithoutSpecialChars(input));
}

/**
 * Checks the given number is a valid US Routing Number
 * using ABA routingNumber checksum algorithm: http://www.brainjar.com/js/validation/
 * @param {String} number
 * @returns {Boolean}
 */
function isValidRoutingNumber(number) {
    let n = 0;
    for (let i = 0; i < number.length; i += 3) {
        n += parseInt(number.charAt(i), 10) * 3 + parseInt(number.charAt(i + 1), 10) * 7 + parseInt(number.charAt(i + 2), 10);
    }

    // If the resulting sum is an even multiple of ten (but not zero),
    // the ABA routing number is valid.
    if (n !== 0 && n % 10 === 0) {
        return true;
    }
    return false;
}

/**
 * Checks that the provided name doesn't contain any commas or semicolons
 *
 * @param {String} name
 * @returns {Boolean}
 */
function isValidDisplayName(name) {
    return !name.includes(',') && !name.includes(';');
}

/**
 * Checks that the provided legal name doesn't contain special characters
 *
 * @param {String} name
 * @returns {Boolean}
 */
function isValidLegalName(name) {
    return CONST.REGEX.ALPHABETIC_AND_LATIN_CHARS.test(name);
}

/**
 * Checks if the provided string includes any of the provided reserved words
 *
 * @param {String} value
 * @param {String[]} reservedWords
 * @returns {Boolean}
 */
function doesContainReservedWord(value, reservedWords) {
    const valueToCheck = value.trim().toLowerCase();
    return _.some(reservedWords, (reservedWord) => valueToCheck.includes(reservedWord.toLowerCase()));
}

/**
 * Checks if is one of the certain names which are reserved for default rooms
 * and should not be used for policy rooms.
 *
 * @param {String} roomName
 * @returns {Boolean}
 */
function isReservedRoomName(roomName) {
    return _.contains(CONST.REPORT.RESERVED_ROOM_NAMES, roomName);
}

/**
 * Checks if the room name already exists.
 *
 * @param {String} roomName
 * @param {Object} reports
 * @param {String} policyID
 * @returns {Boolean}
 */
function isExistingRoomName(roomName, reports, policyID) {
    return _.some(reports, (report) => report && report.policyID === policyID && report.reportName === roomName);
}

/**
 * Checks if a room name is valid by checking that:
 * - It starts with a hash '#'
 * - After the first character, it contains only lowercase letters, numbers, and dashes
 * - It's between 1 and MAX_ROOM_NAME_LENGTH characters long
 *
 * @param {String} roomName
 * @returns {Boolean}
 */
function isValidRoomName(roomName) {
    return CONST.REGEX.ROOM_NAME.test(roomName);
}

/**
 * Checks if tax ID consists of 9 digits
 *
 * @param {String} taxID
 * @returns {Boolean}
 */
function isValidTaxID(taxID) {
    return taxID && CONST.REGEX.TAX_ID.test(taxID);
}

/**
 * Checks if a string value is a number.
 *
 * @param {String} value
 * @returns {Boolean}
 */
function isNumeric(value) {
    if (typeof value !== 'string') {
        return false;
    }
    return /^\d*$/.test(value);
}

/**
 * Checks that the provided accountID is a number and bigger than 0.
 *
 * @param {Number} accountID
 * @returns {Boolean}
 */
function isValidAccountRoute(accountID) {
    return CONST.REGEX.NUMBER.test(accountID) && accountID > 0;
}

export {
    meetsMinimumAgeRequirement,
    meetsMaximumAgeRequirement,
    getAgeRequirementError,
    isValidAddress,
    isValidDate,
    isValidPastDate,
    isValidSecurityCode,
    isValidExpirationDate,
    isValidDebitCard,
    isValidIndustryCode,
    isValidZipCode,
    isRequiredFulfilled,
    isValidUSPhone,
    isValidWebsite,
    validateIdentity,
    isValidTwoFactorCode,
    isNumericWithSpecialChars,
    isValidPaypalUsername,
    isValidRoutingNumber,
    isValidSSNLastFour,
    isValidSSNFullNine,
    isReservedRoomName,
    isExistingRoomName,
    isValidRoomName,
    isValidTaxID,
    isValidValidateCode,
    isValidDisplayName,
    isValidLegalName,
    doesContainReservedWord,
    isNumeric,
    isValidAccountRoute,
};
