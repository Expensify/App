import {parsePhoneNumber} from 'awesome-phonenumber';
import {addYears, endOfMonth, format, isAfter, isBefore, isSameDay, isValid, isWithinInterval, parse, startOfDay, subYears} from 'date-fns';
import {URL_REGEX_WITH_REQUIRED_PROTOCOL} from 'expensify-common/lib/Url';
import isDate from 'lodash/isDate';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import CONST from '@src/CONST';
import {Report} from '@src/types/onyx';
import * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import * as CardUtils from './CardUtils';
import * as LoginUtils from './LoginUtils';
import StringUtils from './StringUtils';

/**
 * Implements the Luhn Algorithm, a checksum formula used to validate credit card
 * numbers.
 */
function validateCardNumber(value: string): boolean {
    let sum = 0;
    for (let i = 0; i < value.length; i++) {
        let intVal = parseInt(value.substr(i, 1), 10);
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
 */
function isValidAddress(value: string): boolean {
    if (!CONST.REGEX.ANY_VALUE.test(value)) {
        return false;
    }

    return !CONST.REGEX.PO_BOX.test(value);
}

/**
 * Validate date fields
 */
function isValidDate(date: string | Date): boolean {
    if (!date) {
        return false;
    }

    const pastDate = subYears(new Date(), 1000);
    const futureDate = addYears(new Date(), 1000);
    const testDate = new Date(date);
    return isValid(testDate) && isAfter(testDate, pastDate) && isBefore(testDate, futureDate);
}

/**
 * Validate that date entered isn't a future date.
 */
function isValidPastDate(date: string | Date): boolean {
    if (!date) {
        return false;
    }

    const pastDate = subYears(new Date(), 1000);
    const currentDate = new Date();
    const testDate = startOfDay(new Date(date));
    return isValid(testDate) && isAfter(testDate, pastDate) && isBefore(testDate, currentDate);
}

/**
 * Used to validate a value that is "required".
 */
function isRequiredFulfilled(value: string | Date | unknown[] | Record<string, unknown>): boolean {
    if (typeof value === 'string') {
        return !StringUtils.isEmptyString(value);
    }

    if (isDate(value)) {
        return isValidDate(value);
    }
    if (Array.isArray(value) || isObject(value)) {
        return !isEmpty(value);
    }
    return Boolean(value);
}

/**
 * Used to add requiredField error to the fields passed.
 */
function getFieldRequiredErrors(values: OnyxCommon.Errors, requiredFields: string[]) {
    const errors: OnyxCommon.Errors = {};
    requiredFields.forEach((fieldKey) => {
        if (isRequiredFulfilled(values[fieldKey])) {
            return;
        }
        errors[fieldKey] = 'common.error.fieldRequired';
    });
    return errors;
}

/**
 * Validates that this is a valid expiration date. Supports the following formats:
 * 1. MM/YY
 * 2. MM/YYYY
 * 3. MMYY
 * 4. MMYYYY
 */
function isValidExpirationDate(string: string): boolean {
    if (!CONST.REGEX.CARD_EXPIRATION_DATE.test(string)) {
        return false;
    }

    // Use the last of the month to check if the expiration date is in the future or not
    const expirationDate = `${CardUtils.getYearFromExpirationDateString(string)}-${CardUtils.getMonthFromExpirationDateString(string)}-01`;
    return isAfter(new Date(expirationDate), endOfMonth(new Date()));
}

/**
 * Validates that this is a valid security code
 * in the XXX or XXXX format.
 */
function isValidSecurityCode(string: string): boolean {
    return CONST.REGEX.CARD_SECURITY_CODE.test(string);
}

/**
 * Validates a debit card number (15 or 16 digits).
 */
function isValidDebitCard(string: string): boolean {
    if (!CONST.REGEX.CARD_NUMBER.test(string)) {
        return false;
    }

    return validateCardNumber(string);
}

function isValidIndustryCode(code: string): boolean {
    return CONST.REGEX.INDUSTRY_CODE.test(code);
}

function isValidZipCode(zipCode: string): boolean {
    return CONST.REGEX.ZIP_CODE.test(zipCode);
}

function isValidSSNLastFour(ssnLast4: string): boolean {
    return CONST.REGEX.SSN_LAST_FOUR.test(ssnLast4);
}

function isValidSSNFullNine(ssnFull9: string): boolean {
    return CONST.REGEX.SSN_FULL_NINE.test(ssnFull9);
}

/**
 * Validate that a date meets the minimum age requirement.
 */
function meetsMinimumAgeRequirement(date: string): boolean {
    const testDate = new Date(date);
    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);
    return isValid(testDate) && (isSameDay(testDate, minDate) || isBefore(testDate, minDate));
}

/**
 * Validate that a date meets the maximum age requirement.
 */
function meetsMaximumAgeRequirement(date: string): boolean {
    const testDate = new Date(date);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    return isValid(testDate) && (isSameDay(testDate, maxDate) || isAfter(testDate, maxDate));
}

/**
 * Validate that given date is in a specified range of years before now.
 */
function getAgeRequirementError(date: string, minimumAge: number, maximumAge: number): string | Array<string | Record<string, string>> {
    const currentDate = startOfDay(new Date());
    const testDate = parse(date, CONST.DATE.FNS_FORMAT_STRING, currentDate);

    if (!isValid(testDate)) {
        return 'common.error.dateInvalid';
    }

    const maximalDate = subYears(currentDate, minimumAge);
    const minimalDate = subYears(currentDate, maximumAge);

    if (isWithinInterval(testDate, {start: minimalDate, end: maximalDate})) {
        return '';
    }

    if (isSameDay(testDate, maximalDate) || isAfter(testDate, maximalDate)) {
        return ['privatePersonalDetails.error.dateShouldBeBefore', {dateString: format(maximalDate, CONST.DATE.FNS_FORMAT_STRING)}];
    }

    return ['privatePersonalDetails.error.dateShouldBeAfter', {dateString: format(minimalDate, CONST.DATE.FNS_FORMAT_STRING)}];
}

/**
 * Similar to backend, checks whether a website has a valid URL or not.
 * http/https/ftp URL scheme required.
 */
function isValidWebsite(url: string): boolean {
    return new RegExp(`^${URL_REGEX_WITH_REQUIRED_PROTOCOL}$`, 'i').test(url);
}

function validateIdentity(identity: Record<string, string>): Record<string, boolean> {
    const requiredFields = ['firstName', 'lastName', 'street', 'city', 'zipCode', 'state', 'ssnLast4', 'dob'];
    const errors: Record<string, boolean> = {};

    // Check that all required fields are filled
    requiredFields.forEach((fieldName) => {
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

function isValidUSPhone(phoneNumber = '', isCountryCodeOptional?: boolean): boolean {
    const phone = phoneNumber || '';
    const regionCode = isCountryCodeOptional ? CONST.COUNTRY.US : undefined;

    const parsedPhoneNumber = parsePhoneNumber(phone, {regionCode});
    return parsedPhoneNumber.possible && parsedPhoneNumber.regionCode === CONST.COUNTRY.US;
}

function isValidValidateCode(validateCode: string): boolean {
    return Boolean(validateCode.match(CONST.VALIDATE_CODE_REGEX_STRING));
}

function isValidRecoveryCode(recoveryCode: string): boolean {
    return Boolean(recoveryCode.match(CONST.RECOVERY_CODE_REGEX_STRING));
}

function isValidTwoFactorCode(code: string): boolean {
    return Boolean(code.match(CONST.REGEX.CODE_2FA));
}

/**
 * Checks whether a value is a numeric string including `(`, `)`, `-` and optional leading `+`
 */
function isNumericWithSpecialChars(input: string): boolean {
    return /^\+?[\d\\+]*$/.test(LoginUtils.getPhoneNumberWithoutSpecialChars(input));
}

/**
 * Checks the given number is a valid US Routing Number
 * using ABA routingNumber checksum algorithm: http://www.brainjar.com/js/validation/
 */
function isValidRoutingNumber(routingNumber: string): boolean {
    let n = 0;
    for (let i = 0; i < routingNumber.length; i += 3) {
        n += parseInt(routingNumber.charAt(i), 10) * 3 + parseInt(routingNumber.charAt(i + 1), 10) * 7 + parseInt(routingNumber.charAt(i + 2), 10);
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
 */
function isValidDisplayName(name: string): boolean {
    return !name.includes(',') && !name.includes(';');
}

/**
 * Checks that the provided legal name doesn't contain special characters
 */
function isValidLegalName(name: string): boolean {
    return CONST.REGEX.ALPHABETIC_AND_LATIN_CHARS.test(name);
}

/**
 * Checks if the provided string includes any of the provided reserved words
 */
function doesContainReservedWord(value: string, reservedWords: string[]): boolean {
    const valueToCheck = value.trim().toLowerCase();
    return reservedWords.some((reservedWord) => valueToCheck.includes(reservedWord.toLowerCase()));
}

/**
 * Checks if is one of the certain names which are reserved for default rooms
 * and should not be used for policy rooms.
 */
function isReservedRoomName(roomName: string): boolean {
    return (CONST.REPORT.RESERVED_ROOM_NAMES as readonly string[]).includes(roomName);
}

/**
 * Checks if the room name already exists.
 */
function isExistingRoomName(roomName: string, reports: Record<string, Report>, policyID: string): boolean {
    return Object.values(reports).some((report) => report && report.policyID === policyID && report.reportName === roomName);
}

/**
 * Checks if a room name is valid by checking that:
 * - It starts with a hash '#'
 * - After the first character, it contains only lowercase letters, numbers, and dashes
 * - It's between 1 and MAX_ROOM_NAME_LENGTH characters long
 */
function isValidRoomName(roomName: string): boolean {
    return CONST.REGEX.ROOM_NAME.test(roomName);
}

/**
 * Checks if tax ID consists of 9 digits
 */
function isValidTaxID(taxID: string): boolean {
    return CONST.REGEX.TAX_ID.test(taxID);
}

/**
 * Checks if a string value is a number.
 */
function isNumeric(value: string): boolean {
    if (typeof value !== 'string') {
        return false;
    }
    return /^\d*$/.test(value);
}

/**
 * Checks that the provided accountID is a number and bigger than 0.
 */
function isValidAccountRoute(accountID: number): boolean {
    return CONST.REGEX.NUMBER.test(String(accountID)) && accountID > 0;
}

type ValuesType = Record<string, unknown>;

/**
 * This function is used to remove invisible characters from strings before validation and submission.
 */
function prepareValues(values: ValuesType): ValuesType {
    const trimmedStringValues: ValuesType = {};

    for (const [inputID, inputValue] of Object.entries(values)) {
        if (typeof inputValue === 'string') {
            trimmedStringValues[inputID] = StringUtils.removeInvisibleCharacters(inputValue);
        } else {
            trimmedStringValues[inputID] = inputValue;
        }
    }

    return trimmedStringValues;
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
    getFieldRequiredErrors,
    isValidUSPhone,
    isValidWebsite,
    validateIdentity,
    isValidTwoFactorCode,
    isNumericWithSpecialChars,
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
    isValidRecoveryCode,
    prepareValues,
};
