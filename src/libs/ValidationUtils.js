"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDateTimeIsAtLeastOneMinuteInFuture = void 0;
exports.meetsMinimumAgeRequirement = meetsMinimumAgeRequirement;
exports.meetsMaximumAgeRequirement = meetsMaximumAgeRequirement;
exports.getAgeRequirementError = getAgeRequirementError;
exports.isValidAddress = isValidAddress;
exports.isValidDate = isValidDate;
exports.isValidPastDate = isValidPastDate;
exports.isValidSecurityCode = isValidSecurityCode;
exports.isValidExpirationDate = isValidExpirationDate;
exports.isValidDebitCard = isValidDebitCard;
exports.isValidIndustryCode = isValidIndustryCode;
exports.isValidZipCode = isValidZipCode;
exports.isValidPaymentZipCode = isValidPaymentZipCode;
exports.isRequiredFulfilled = isRequiredFulfilled;
exports.getFieldRequiredErrors = getFieldRequiredErrors;
exports.isValidUSPhone = isValidUSPhone;
exports.isValidPhoneNumber = isValidPhoneNumber;
exports.isValidWebsite = isValidWebsite;
exports.validateIdentity = validateIdentity;
exports.isValidTwoFactorCode = isValidTwoFactorCode;
exports.isNumericWithSpecialChars = isNumericWithSpecialChars;
exports.isValidRoutingNumber = isValidRoutingNumber;
exports.isValidSSNLastFour = isValidSSNLastFour;
exports.isValidSSNFullNine = isValidSSNFullNine;
exports.isReservedRoomName = isReservedRoomName;
exports.isExistingRoomName = isExistingRoomName;
exports.isValidRoomName = isValidRoomName;
exports.isValidRoomNameWithoutLimits = isValidRoomNameWithoutLimits;
exports.isValidTaxID = isValidTaxID;
exports.isValidValidateCode = isValidValidateCode;
exports.isValidCompanyName = isValidCompanyName;
exports.isValidDisplayName = isValidDisplayName;
exports.isValidLegalName = isValidLegalName;
exports.doesContainReservedWord = doesContainReservedWord;
exports.isNumeric = isNumeric;
exports.isValidAccountRoute = isValidAccountRoute;
exports.getDatePassedError = getDatePassedError;
exports.isValidRecoveryCode = isValidRecoveryCode;
exports.prepareValues = prepareValues;
exports.isValidPersonName = isValidPersonName;
exports.isValidPercentage = isValidPercentage;
exports.isExistingTaxName = isExistingTaxName;
exports.isValidSubscriptionSize = isValidSubscriptionSize;
exports.isExistingTaxCode = isExistingTaxCode;
exports.isPublicDomain = isPublicDomain;
exports.isValidEmail = isValidEmail;
exports.isValidPhoneInternational = isValidPhoneInternational;
exports.isValidZipCodeInternational = isValidZipCodeInternational;
exports.isValidOwnershipPercentage = isValidOwnershipPercentage;
exports.isValidRegistrationNumber = isValidRegistrationNumber;
exports.isValidInputLength = isValidInputLength;
exports.isValidTaxIDEINNumber = isValidTaxIDEINNumber;
var date_fns_1 = require("date-fns");
var expensify_common_1 = require("expensify-common");
var isEmpty_1 = require("lodash/isEmpty");
var isObject_1 = require("lodash/isObject");
var CONST_1 = require("@src/CONST");
var CardUtils_1 = require("./CardUtils");
var DateUtils_1 = require("./DateUtils");
var Localize_1 = require("./Localize");
var LoginUtils_1 = require("./LoginUtils");
var PhoneNumber_1 = require("./PhoneNumber");
var StringUtils_1 = require("./StringUtils");
/**
 * Implements the Luhn Algorithm, a checksum formula used to validate credit card
 * numbers.
 */
function validateCardNumber(value) {
    var sum = 0;
    var shouldDouble = false;
    // Loop through the card number from right to left
    for (var i = value.length - 1; i >= 0; i--) {
        var intVal = parseInt(value[i], 10);
        // Double every second digit from the right
        if (shouldDouble) {
            intVal *= 2;
            if (intVal > 9) {
                intVal -= 9;
            }
        }
        sum += intVal;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}
/**
 * Validating that this is a valid address (PO boxes are not allowed)
 */
function isValidAddress(value) {
    if (typeof value !== 'string') {
        return false;
    }
    if (!CONST_1.default.REGEX.ANY_VALUE.test(value) || value.match(CONST_1.default.REGEX.ALL_EMOJIS)) {
        return false;
    }
    return !CONST_1.default.REGEX.PO_BOX.test(value);
}
/**
 * Validate date fields
 */
function isValidDate(date) {
    if (!date) {
        return false;
    }
    var pastDate = (0, date_fns_1.subYears)(new Date(), 1000);
    var futureDate = (0, date_fns_1.addYears)(new Date(), 1000);
    var testDate = new Date(date);
    return (0, date_fns_1.isValid)(testDate) && (0, date_fns_1.isAfter)(testDate, pastDate) && (0, date_fns_1.isBefore)(testDate, futureDate);
}
/**
 * Validate that date entered isn't a future date.
 */
function isValidPastDate(date) {
    if (!date) {
        return false;
    }
    var pastDate = (0, date_fns_1.subYears)(new Date(), 1000);
    var currentDate = new Date();
    var testDate = (0, date_fns_1.startOfDay)(new Date(date));
    return (0, date_fns_1.isValid)(testDate) && (0, date_fns_1.isAfter)(testDate, pastDate) && (0, date_fns_1.isBefore)(testDate, currentDate);
}
/**
 * Used to validate a value that is "required".
 * @param value - field value
 */
function isRequiredFulfilled(value) {
    if (!value) {
        return false;
    }
    if (typeof value === 'string') {
        return !StringUtils_1.default.isEmptyString(value);
    }
    if (DateUtils_1.default.isDate(value)) {
        return isValidDate(value);
    }
    if (Array.isArray(value) || (0, isObject_1.default)(value)) {
        return !(0, isEmpty_1.default)(value);
    }
    return !!value;
}
/**
 * Used to add requiredField error to the fields passed.
 * @param values - all form values
 * @param requiredFields - required fields for particular form
 */
function getFieldRequiredErrors(values, requiredFields) {
    var errors = {};
    requiredFields.forEach(function (fieldKey) {
        if (isRequiredFulfilled(values[fieldKey])) {
            return;
        }
        errors[fieldKey] = (0, Localize_1.translateLocal)('common.error.fieldRequired');
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
function isValidExpirationDate(string) {
    if (!CONST_1.default.REGEX.CARD_EXPIRATION_DATE.test(string)) {
        return false;
    }
    // Use the last of the month to check if the expiration date is in the future or not
    var expirationDate = "".concat((0, CardUtils_1.getYearFromExpirationDateString)(string), "-").concat((0, CardUtils_1.getMonthFromExpirationDateString)(string), "-01");
    return (0, date_fns_1.isAfter)(new Date(expirationDate), (0, date_fns_1.endOfMonth)(new Date()));
}
/**
 * Validates that this is a valid security code
 * in the XXX or XXXX format.
 */
function isValidSecurityCode(string) {
    return CONST_1.default.REGEX.CARD_SECURITY_CODE.test(string);
}
/**
 * Validates a debit card number (15 or 16 digits).
 */
function isValidDebitCard(string) {
    if (!CONST_1.default.REGEX.CARD_NUMBER.test(string)) {
        return false;
    }
    return validateCardNumber(string);
}
function isValidIndustryCode(code) {
    return CONST_1.default.REGEX.INDUSTRY_CODE.test(code);
}
function isValidZipCode(zipCode) {
    return CONST_1.default.REGEX.ZIP_CODE.test(zipCode);
}
function isValidPaymentZipCode(zipCode) {
    return CONST_1.default.REGEX.ALPHANUMERIC_WITH_SPACE_AND_HYPHEN.test(zipCode);
}
function isValidSSNLastFour(ssnLast4) {
    return CONST_1.default.REGEX.SSN_LAST_FOUR.test(ssnLast4);
}
function isValidSSNFullNine(ssnFull9) {
    return CONST_1.default.REGEX.SSN_FULL_NINE.test(ssnFull9);
}
/**
 * Validate that a date meets the minimum age requirement.
 */
function meetsMinimumAgeRequirement(date) {
    var testDate = new Date(date);
    var minDate = (0, date_fns_1.subYears)(new Date(), CONST_1.default.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);
    return (0, date_fns_1.isValid)(testDate) && ((0, date_fns_1.isSameDay)(testDate, minDate) || (0, date_fns_1.isBefore)(testDate, minDate));
}
/**
 * Validate that a date meets the maximum age requirement.
 */
function meetsMaximumAgeRequirement(date) {
    var testDate = new Date(date);
    var maxDate = (0, date_fns_1.subYears)(new Date(), CONST_1.default.DATE_BIRTH.MAX_AGE);
    return (0, date_fns_1.isValid)(testDate) && ((0, date_fns_1.isSameDay)(testDate, maxDate) || (0, date_fns_1.isAfter)(testDate, maxDate));
}
/**
 * Validate that given date is in a specified range of years before now.
 */
function getAgeRequirementError(date, minimumAge, maximumAge) {
    var currentDate = (0, date_fns_1.startOfDay)(new Date());
    var testDate = (0, date_fns_1.parse)(date, CONST_1.default.DATE.FNS_FORMAT_STRING, currentDate);
    if (!(0, date_fns_1.isValid)(testDate)) {
        return (0, Localize_1.translateLocal)('common.error.dateInvalid');
    }
    var maximalDate = (0, date_fns_1.subYears)(currentDate, minimumAge);
    var minimalDate = (0, date_fns_1.subYears)(currentDate, maximumAge);
    if ((0, date_fns_1.isWithinInterval)(testDate, { start: minimalDate, end: maximalDate })) {
        return '';
    }
    if ((0, date_fns_1.isSameDay)(testDate, maximalDate) || (0, date_fns_1.isAfter)(testDate, maximalDate)) {
        return (0, Localize_1.translateLocal)('privatePersonalDetails.error.dateShouldBeBefore', { dateString: (0, date_fns_1.format)(maximalDate, CONST_1.default.DATE.FNS_FORMAT_STRING) });
    }
    return (0, Localize_1.translateLocal)('privatePersonalDetails.error.dateShouldBeAfter', { dateString: (0, date_fns_1.format)(minimalDate, CONST_1.default.DATE.FNS_FORMAT_STRING) });
}
/**
 * Validate that given date is not in the past.
 */
function getDatePassedError(inputDate) {
    var currentDate = new Date();
    var parsedDate = new Date("".concat(inputDate, "T00:00:00")); // set time to 00:00:00 for accurate comparison
    // If input date is not valid, return an error
    if (!(0, date_fns_1.isValid)(parsedDate)) {
        return (0, Localize_1.translateLocal)('common.error.dateInvalid');
    }
    // Clear time for currentDate so comparison is based solely on the date
    currentDate.setHours(0, 0, 0, 0);
    if (parsedDate < currentDate) {
        return (0, Localize_1.translateLocal)('common.error.dateInvalid');
    }
    return '';
}
/**
 * Similar to backend, checks whether a website has a valid URL or not.
 * http/https/ftp URL scheme required.
 */
function isValidWebsite(url) {
    return new RegExp("^".concat(expensify_common_1.Url.URL_REGEX_WITH_REQUIRED_PROTOCOL, "$"), 'i').test(url);
}
/** Checks if the domain is public */
function isPublicDomain(domain) {
    return expensify_common_1.PUBLIC_DOMAINS_SET.has(domain.toLowerCase());
}
function validateIdentity(identity) {
    var requiredFields = ['firstName', 'lastName', 'street', 'city', 'zipCode', 'state', 'ssnLast4', 'dob'];
    var errors = {};
    // Check that all required fields are filled
    requiredFields.forEach(function (fieldName) {
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
    }
    else if (!meetsMinimumAgeRequirement(identity.dob)) {
        errors.dobAge = true;
    }
    if (!isValidSSNLastFour(identity.ssnLast4)) {
        errors.ssnLast4 = true;
    }
    return errors;
}
function isValidUSPhone(phoneNumber, isCountryCodeOptional) {
    if (phoneNumber === void 0) { phoneNumber = ''; }
    var phone = phoneNumber || '';
    var regionCode = isCountryCodeOptional ? CONST_1.default.COUNTRY.US : undefined;
    // When we pass regionCode as an option to parsePhoneNumber it wrongly assumes inputs like '=15123456789' as valid
    // so we need to check if it is a valid phone.
    if (regionCode && !expensify_common_1.Str.isValidPhoneFormat(phone)) {
        return false;
    }
    var parsedPhoneNumber = (0, PhoneNumber_1.parsePhoneNumber)(phone, { regionCode: regionCode });
    return parsedPhoneNumber.possible && parsedPhoneNumber.regionCode === CONST_1.default.COUNTRY.US;
}
function isValidPhoneNumber(phoneNumber) {
    if (!CONST_1.default.ACCEPTED_PHONE_CHARACTER_REGEX.test(phoneNumber) || CONST_1.default.REPEATED_SPECIAL_CHAR_PATTERN.test(phoneNumber)) {
        return false;
    }
    var parsedPhoneNumber = (0, PhoneNumber_1.parsePhoneNumber)(phoneNumber);
    return parsedPhoneNumber.possible;
}
function isValidValidateCode(validateCode) {
    return !!validateCode.match(CONST_1.default.VALIDATE_CODE_REGEX_STRING);
}
function isValidRecoveryCode(recoveryCode) {
    return !!recoveryCode.match(CONST_1.default.RECOVERY_CODE_REGEX_STRING);
}
function isValidTwoFactorCode(code) {
    return !!code.match(CONST_1.default.REGEX.CODE_2FA);
}
/**
 * Checks whether a value is a numeric string including `(`, `)`, `-` and optional leading `+`
 */
function isNumericWithSpecialChars(input) {
    return /^\+?[\d\\+]*$/.test((0, LoginUtils_1.getPhoneNumberWithoutSpecialChars)(input));
}
/**
 * Checks the given number is a valid US Routing Number
 * using ABA routingNumber checksum algorithm: http://www.brainjar.com/js/validation/
 */
function isValidRoutingNumber(routingNumber) {
    var n = 0;
    for (var i = 0; i < routingNumber.length; i += 3) {
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
 * Checks that the provided name doesn't contain any emojis
 */
function isValidCompanyName(name) {
    return !name.match(CONST_1.default.REGEX.ALL_EMOJIS);
}
/**
 * Checks that the provided name doesn't contain any commas or semicolons
 */
function isValidDisplayName(name) {
    return !name.includes(',') && !name.includes(';');
}
/**
 * Checks that the provided legal name doesn't contain special characters
 */
function isValidLegalName(name) {
    return CONST_1.default.REGEX.ALPHABETIC_AND_LATIN_CHARS.test(name);
}
/**
 * Checks that the provided name doesn't contain special characters or numbers
 */
function isValidPersonName(value) {
    return /^[^\d^!#$%*=<>;{}"]+$/.test(value);
}
/**
 * Checks if the provided string includes any of the provided reserved words
 */
function doesContainReservedWord(value, reservedWords) {
    var valueToCheck = value.trim().toLowerCase();
    return reservedWords.some(function (reservedWord) { return valueToCheck.includes(reservedWord.toLowerCase()); });
}
/**
 * Checks if is one of the certain names which are reserved for default rooms
 * and should not be used for policy rooms.
 */
function isReservedRoomName(roomName) {
    return CONST_1.default.REPORT.RESERVED_ROOM_NAMES.includes(roomName);
}
/**
 * Checks if the room name already exists.
 */
function isExistingRoomName(roomName, reports, policyID) {
    return Object.values(reports !== null && reports !== void 0 ? reports : {}).some(function (report) { return report && policyID && report.policyID === policyID && report.reportName === roomName; });
}
/**
 * Checks if a room name is valid by checking that:
 * - It starts with a hash '#'
 * - After the first character, it contains only lowercase letters, numbers, and dashes
 * - It's between 1 and MAX_ROOM_NAME_LENGTH characters long
 */
function isValidRoomName(roomName) {
    return CONST_1.default.REGEX.ROOM_NAME.test(roomName);
}
/**
 * Checks if a room name is valid by checking that:
 * - It starts with a hash '#'
 * - After the first character, it contains only lowercase letters, numbers, and dashes
 */
function isValidRoomNameWithoutLimits(roomName) {
    return CONST_1.default.REGEX.ROOM_NAME_WITHOUT_LIMIT.test(roomName);
}
/**
 * Checks if tax ID consists of 9 digits
 */
function isValidTaxID(taxID) {
    return CONST_1.default.REGEX.TAX_ID.test(taxID);
}
/**
 * Checks if a string value is a number.
 */
function isNumeric(value) {
    if (typeof value !== 'string') {
        return false;
    }
    return CONST_1.default.REGEX.NUMBER.test(value);
}
/**
 * Checks that the provided accountID is a number and bigger than 0.
 */
function isValidAccountRoute(accountID) {
    return CONST_1.default.REGEX.NUMBER.test(String(accountID)) && accountID > 0;
}
/**
 * Validates that the date and time are at least one minute in the future.
 * data - A date and time string in 'YYYY-MM-DD HH:mm:ss.sssZ' format
 * returns an object containing the error messages for the date and time
 */
var validateDateTimeIsAtLeastOneMinuteInFuture = function (data) {
    if (!data) {
        return {
            dateValidationErrorKey: '',
            timeValidationErrorKey: '',
        };
    }
    var parsedInputData = (0, date_fns_1.parseISO)(data);
    var dateValidationErrorKey = DateUtils_1.default.getDayValidationErrorKey(parsedInputData);
    var timeValidationErrorKey = DateUtils_1.default.getTimeValidationErrorKey(parsedInputData);
    return {
        dateValidationErrorKey: dateValidationErrorKey,
        timeValidationErrorKey: timeValidationErrorKey,
    };
};
exports.validateDateTimeIsAtLeastOneMinuteInFuture = validateDateTimeIsAtLeastOneMinuteInFuture;
/**
 * This function is used to remove invisible characters from strings before validation and submission.
 */
function prepareValues(values) {
    var trimmedStringValues = {};
    for (var _i = 0, _a = Object.entries(values); _i < _a.length; _i++) {
        var _b = _a[_i], inputID = _b[0], inputValue = _b[1];
        if (typeof inputValue === 'string') {
            trimmedStringValues[inputID] = StringUtils_1.default.removeInvisibleCharacters(inputValue);
        }
        else {
            trimmedStringValues[inputID] = inputValue;
        }
    }
    return trimmedStringValues;
}
/**
 * Validates the given value if it is correct percentage value.
 */
function isValidPercentage(value) {
    var parsedValue = Number(value);
    return !Number.isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100;
}
/**
 * Validates the given value if it is correct tax name.
 */
function isExistingTaxName(taxName, taxRates) {
    var trimmedTaxName = taxName.trim();
    return !!Object.values(taxRates).find(function (taxRate) { return taxRate.name === trimmedTaxName; });
}
function isExistingTaxCode(taxCode, taxRates) {
    var trimmedTaxCode = taxCode.trim();
    return !!Object.keys(taxRates).find(function (taxID) { return taxID === trimmedTaxCode; });
}
/**
 * Validates the given value if it is correct subscription size.
 */
function isValidSubscriptionSize(subscriptionSize) {
    var parsedSubscriptionSize = Number(subscriptionSize);
    return !Number.isNaN(parsedSubscriptionSize) && parsedSubscriptionSize > 0 && parsedSubscriptionSize <= CONST_1.default.SUBSCRIPTION_SIZE_LIMIT && Number.isInteger(parsedSubscriptionSize);
}
/**
 * Validates the given value if it is correct email address.
 * @param email
 */
function isValidEmail(email) {
    return expensify_common_1.Str.isValidEmail(email);
}
/**
 * Validates the given value if it is correct phone number in E164 format (international standard).
 * @param phoneNumber
 */
function isValidPhoneInternational(phoneNumber) {
    var _a, _b;
    var phoneNumberWithCountryCode = (0, LoginUtils_1.appendCountryCode)(phoneNumber);
    var parsedPhoneNumber = (0, PhoneNumber_1.parsePhoneNumber)(phoneNumberWithCountryCode);
    return parsedPhoneNumber.possible && expensify_common_1.Str.isValidE164Phone((_b = (_a = parsedPhoneNumber.number) === null || _a === void 0 ? void 0 : _a.e164) !== null && _b !== void 0 ? _b : '');
}
/**
 * Validates the given value if it is correct zip code for international addresses.
 * @param zipCode
 */
function isValidZipCodeInternational(zipCode) {
    return /^[a-z0-9][a-z0-9\- ]{0,10}[a-z0-9]$/.test(zipCode);
}
/**
 * Validates the given value if it is correct ownership percentage
 * @param value
 * @param totalOwnedPercentage
 * @param ownerBeingModifiedID
 */
function isValidOwnershipPercentage(value, totalOwnedPercentage, ownerBeingModifiedID) {
    var parsedValue = Number(value);
    var isValidNumber = !Number.isNaN(parsedValue) && parsedValue >= 25 && parsedValue <= 100;
    var totalOwnedPercentageSum = 0;
    var totalOwnedPercentageKeys = Object.keys(totalOwnedPercentage);
    totalOwnedPercentageKeys.forEach(function (key) {
        if (key === ownerBeingModifiedID) {
            return;
        }
        totalOwnedPercentageSum += totalOwnedPercentage[key];
    });
    var isTotalSumValid = totalOwnedPercentageSum + parsedValue <= 100;
    return isValidNumber && isTotalSumValid;
}
/**
 * Validates the given value if it is correct ABN number - https://abr.business.gov.au/Help/AbnFormat
 * @param registrationNumber - number to validate.
 */
function isValidABN(registrationNumber) {
    var cleanedAbn = registrationNumber.replaceAll(/[ _]/g, '');
    if (cleanedAbn.length !== 11) {
        return false;
    }
    var weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    var checksum = __spreadArray([], cleanedAbn, true).reduce(function (total, char, index) {
        var _a;
        var digit = Number(char);
        if (index === 0) {
            digit--;
        } // First digit special rule
        return total + digit * ((_a = weights.at(index)) !== null && _a !== void 0 ? _a : 0); // Using optional chaining for safety
    }, 0);
    return checksum % 89 === 0;
}
/**
 * Validates the given value if it is correct ACN number - https://asic.gov.au/for-business/registering-a-company/steps-to-register-a-company/australian-company-numbers/australian-company-number-digit-check/
 * @param registrationNumber - number to validate.
 */
function isValidACN(registrationNumber) {
    var cleanedAcn = registrationNumber.replaceAll(/\s|-/g, '');
    if (cleanedAcn.length !== 9 || Number.isNaN(Number(cleanedAcn))) {
        return false;
    }
    var weights = [8, 7, 6, 5, 4, 3, 2, 1];
    var tally = weights.reduce(function (total, weight, index) {
        return total + Number(cleanedAcn[index]) * weight;
    }, 0);
    var checkDigit = 10 - (tally % 10);
    return checkDigit === Number(cleanedAcn[8]) || (checkDigit === 10 && Number(cleanedAcn[8]) === 0);
}
/**
 * Validates the given value if it is correct australian registration number.
 * @param registrationNumber
 */
function isValidAURegistrationNumber(registrationNumber) {
    return isValidABN(registrationNumber) || isValidACN(registrationNumber);
}
/**
 * Validates the given value if it is correct british registration number.
 * @param registrationNumber
 */
function isValidGBRegistrationNumber(registrationNumber) {
    return /^(?:\d{8}|[A-Z]{2}\d{6})$/.test(registrationNumber);
}
/**
 * Validates the given value if it is correct canadian registration number.
 * @param registrationNumber
 */
function isValidCARegistrationNumber(registrationNumber) {
    return /^\d{9}(?:[A-Z]{2}\d{4})?$/.test(registrationNumber);
}
/**
 * Validates the given value if it is correct registration number for the given country.
 * @param registrationNumber
 * @param country
 */
function isValidRegistrationNumber(registrationNumber, country) {
    switch (country) {
        case CONST_1.default.COUNTRY.AU:
            return isValidAURegistrationNumber(registrationNumber);
        case CONST_1.default.COUNTRY.GB:
            return isValidGBRegistrationNumber(registrationNumber);
        case CONST_1.default.COUNTRY.CA:
            return isValidCARegistrationNumber(registrationNumber);
        case CONST_1.default.COUNTRY.US:
            return isValidTaxID(registrationNumber);
        default:
            return true;
    }
}
/**
 * Checks if the `inputValue` byte length exceeds the specified byte length,
 * returning `isValid` (boolean) and `byteLength` (number) to be used in dynamic error copy.
 */
function isValidInputLength(inputValue, byteLength) {
    var valueByteLength = StringUtils_1.default.getUTF8ByteLength(inputValue);
    return { isValid: valueByteLength <= byteLength, byteLength: valueByteLength };
}
/**
 * Validates the given value as a U.S. Employer Identification Number (EIN).
 * Format: XX-XXXXXXX
 * @param ein - The EIN to validate.
 */
function isValidEIN(ein) {
    return /^\d{2}-\d{7}$/.test(ein);
}
/**
 * Validates the given value as a UK VAT Registration Number (VRN).
 * Format: Optional "GB" prefix followed by 9 digits.
 * @param vrn - The VRN to validate.
 */
function isValidVRN(vrn) {
    return /^(GB)?\d{9}$/.test(vrn);
}
/**
 * Validates the given value as a Canadian Business Number (BN).
 * Format: 9 digits, optionally followed by a 2-letter program ID and 4-digit reference number.
 * Valid program IDs include: RT, RC, RM, RP, etc.
 * @param bn - The Business Number to validate.
 */
function isValidBN(bn) {
    return /^\d{9}([A-Z]{2}\d{4})?$/.test(bn);
}
/**
 * Validates the given value as a European Union VAT Number.
 * Format: Two-letter country code followed by 8–12 alphanumeric characters.
 * @param vat - The VAT number to validate.
 * @returns True if the value is a valid EU VAT number; otherwise, false.
 */
function isValidEUVATNumber(vat) {
    return /^[A-Z]{2}[A-Z0-9]{8,12}$/.test(vat);
}
/**
 * Validates the given value as a country-specific tax identification number.
 * Delegates to the appropriate country-specific validation function.
 * @param number - The tax ID number to validate.
 * @param country - The country code (e.g., 'US', 'GB', 'CA', 'AU').
 */
function isValidTaxIDEINNumber(number, country) {
    switch (country) {
        case CONST_1.default.COUNTRY.AU:
            return isValidABN(number);
        case CONST_1.default.COUNTRY.GB:
            return isValidVRN(number);
        case CONST_1.default.COUNTRY.CA:
            return isValidBN(number);
        case CONST_1.default.COUNTRY.US:
            return isValidEIN(number);
        default:
            return isValidEUVATNumber(number);
    }
}
