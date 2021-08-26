import moment from 'moment';
import CONST from '../CONST';
import Growl from './Growl';
import {translateLocal} from './translate';


/**
 * Implements the Luhn Algorithm, a checksum formula used to validate credit card
 * numbers.
 *
 * @param {String} val
 * @returns {Boolean}
 */
function validCardNumber(val) {
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
 * Validates that this is a valid expiration date
 * in the MM/YY format
 *
 * @param {String} string
 * @returns {Boolean}
 */
function isValidExpirationDate(string) {
    return CONST.REGEX.CARD_EXPIRATION_DATE.test(string);
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

    return validCardNumber(string);
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
        Growl.error(translateLocal('bankAccount.error.address'));
        return false;
    }

    if (identity.state === '') {
        Growl.error(translateLocal('bankAccount.error.addressState'));
        return false;
    }

    if (!isValidZipCode(identity.zipCode)) {
        Growl.error(translateLocal('bankAccount.error.zipCode'));
        return false;
    }

    if (!isValidDate(identity.dob)) {
        Growl.error(translateLocal('bankAccount.error.dob'));
        return false;
    }

    if (!isValidSSNLastFour(identity.ssnLast4)) {
        Growl.error(translateLocal('bankAccount.error.ssnLast4'));
        return false;
    }

    return true;
}

export {
    isValidAddress,
    isValidDate,
    isValidExpirationDate,
    isValidDebitCard,
    isValidIndustryCode,
    isValidIdentity,
    isValidZipCode,
    isSingleEmoji,
};
