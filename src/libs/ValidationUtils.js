import moment from 'moment';
import _ from 'underscore';
import CONST from '../CONST';

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
 * Validate that "date" is 18 years old or older
 *
 * @param {String} date
 * @returns {Boolean}
 */
function isValidAge(date) {
    return moment().diff(moment(date, 'YYYY-MM-DD'), 'years') >= 18;
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
    validateIdentity,
    isValidZipCode,
    isRequiredFulfilled,
    isValidURL,
};
