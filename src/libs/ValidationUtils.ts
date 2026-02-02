import {addYears, endOfMonth, format, isAfter, isBefore, isSameDay, isValid, isWithinInterval, parse, parseISO, startOfDay, subYears} from 'date-fns';
import {PUBLIC_DOMAINS_SET, Str, Url} from 'expensify-common';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import type {OnyxCollection} from 'react-native-onyx';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues, FormValue} from '@components/Form/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import type {Report, TaxRates} from '@src/types/onyx';
import {getMonthFromExpirationDateString, getYearFromExpirationDateString} from './CardUtils';
import DateUtils from './DateUtils';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from './Localize';
import {getPhoneNumberWithoutSpecialChars} from './LoginUtils';
import {parsePhoneNumber} from './PhoneNumber';
import StringUtils from './StringUtils';

/**
 * Implements the Luhn Algorithm, a checksum formula used to validate credit card
 * numbers.
 */
function validateCardNumber(value: string): boolean {
    let sum = 0;
    let shouldDouble = false;

    // Loop through the card number from right to left
    for (let i = value.length - 1; i >= 0; i--) {
        let intVal = parseInt(value[i], 10);

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
function isValidAddress(value: FormValue): boolean {
    if (typeof value !== 'string') {
        return false;
    }

    if (!CONST.REGEX.ANY_VALUE.test(value) || value.match(CONST.REGEX.ALL_EMOJIS)) {
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

    if (typeof date === 'string') {
        const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
        if (!isValid(parsedDate)) {
            return false;
        }
        return isAfter(parsedDate, pastDate) && isBefore(parsedDate, futureDate);
    }

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
 * @param value - field value
 */
function isRequiredFulfilled(value?: FormValue | number[] | string[] | Record<string, string>): boolean {
    if (!value) {
        return false;
    }
    if (typeof value === 'string') {
        return !StringUtils.isEmptyString(value);
    }

    if (DateUtils.isDate(value)) {
        return isValidDate(value);
    }
    if (Array.isArray(value) || isObject(value)) {
        return !isEmpty(value);
    }
    return !!value;
}

/**
 * Used to add requiredField error to the fields passed.
 * @param values - all form values
 * @param requiredFields - required fields for particular form
 */
function getFieldRequiredErrors<TFormID extends OnyxFormKey>(values: FormOnyxValues<TFormID>, requiredFields: Array<FormOnyxKeys<TFormID>>): FormInputErrors<TFormID> {
    const errors: FormInputErrors<TFormID> = {};

    for (const fieldKey of requiredFields) {
        if (isRequiredFulfilled(values[fieldKey] as FormValue)) {
            continue;
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        errors[fieldKey] = translateLocal('common.error.fieldRequired');
    }

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
    const expirationDate = `${getYearFromExpirationDateString(string)}-${getMonthFromExpirationDateString(string)}-01`;
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

function isValidPaymentZipCode(zipCode: string): boolean {
    return CONST.REGEX.ALPHANUMERIC_WITH_SPACE_AND_HYPHEN.test(zipCode);
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
function getAgeRequirementError(date: string, minimumAge: number, maximumAge: number): string {
    const currentDate = startOfDay(new Date());
    const testDate = parse(date, CONST.DATE.FNS_FORMAT_STRING, currentDate);

    if (!isValid(testDate)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('common.error.dateInvalid');
    }

    const maximalDate = subYears(currentDate, minimumAge);
    const minimalDate = subYears(currentDate, maximumAge);

    if (isWithinInterval(testDate, {start: minimalDate, end: maximalDate})) {
        return '';
    }

    if (isSameDay(testDate, maximalDate) || isAfter(testDate, maximalDate)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('privatePersonalDetails.error.dateShouldBeBefore', format(maximalDate, CONST.DATE.FNS_FORMAT_STRING));
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('privatePersonalDetails.error.dateShouldBeAfter', format(minimalDate, CONST.DATE.FNS_FORMAT_STRING));
}

/**
 * Validate that given date is not in the past.
 */
function getDatePassedError(inputDate: string): string {
    const currentDate = new Date();
    const parsedDate = new Date(`${inputDate}T00:00:00`); // set time to 00:00:00 for accurate comparison

    // If input date is not valid, return an error
    if (!isValid(parsedDate)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('common.error.dateInvalid');
    }

    // Clear time for currentDate so comparison is based solely on the date
    currentDate.setHours(0, 0, 0, 0);

    if (parsedDate < currentDate) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('common.error.dateInvalid');
    }

    return '';
}

/**
 * Similar to backend, checks whether a website has a valid URL or not.
 * http/https/ftp URL scheme required.
 */
function isValidWebsite(url: string): boolean {
    return new RegExp(`^${Url.URL_REGEX_WITH_REQUIRED_PROTOCOL}$`, 'i').test(url);
}

/** Checks if the domain is public */
function isPublicDomain(domain: string): boolean {
    return PUBLIC_DOMAINS_SET.has(domain.toLowerCase());
}

function validateIdentity(identity: Record<string, string>): Record<string, boolean> {
    const requiredFields = ['firstName', 'lastName', 'street', 'city', 'zipCode', 'state', 'ssnLast4', 'dob'];
    const errors: Record<string, boolean> = {};

    // Check that all required fields are filled
    for (const fieldName of requiredFields) {
        if (isRequiredFulfilled(identity[fieldName])) {
            continue;
        }
        errors[fieldName] = true;
    }

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

    // When we pass regionCode as an option to parsePhoneNumber it wrongly assumes inputs like '=15123456789' as valid
    // so we need to check if it is a valid phone.
    if (regionCode && !Str.isValidPhoneFormat(phone)) {
        return false;
    }

    const parsedPhoneNumber = parsePhoneNumber(phone, {regionCode});
    return parsedPhoneNumber.possible && parsedPhoneNumber.regionCode === CONST.COUNTRY.US;
}

function isValidPhoneNumber(phoneNumber: string): boolean {
    if (!CONST.ACCEPTED_PHONE_CHARACTER_REGEX.test(phoneNumber) || CONST.REPEATED_SPECIAL_CHAR_PATTERN.test(phoneNumber)) {
        return false;
    }
    const parsedPhoneNumber = parsePhoneNumber(phoneNumber);
    return parsedPhoneNumber.possible;
}

function isValidValidateCode(validateCode: string): boolean {
    return !!validateCode.match(CONST.VALIDATE_CODE_REGEX_STRING);
}

function isValidRecoveryCode(recoveryCode: string): boolean {
    return !!recoveryCode.match(CONST.RECOVERY_CODE_REGEX_STRING);
}

function isValidTwoFactorCode(code: string): boolean {
    return !!code.match(CONST.REGEX.CODE_2FA);
}

/**
 * Checks whether a value is a numeric string including `(`, `)`, `-` and optional leading `+`
 */
function isNumericWithSpecialChars(input: string): boolean {
    return /^\+?[\d\\+]*$/.test(getPhoneNumberWithoutSpecialChars(input));
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
 * Checks that the provided name doesn't contain any emojis
 */
function isValidCompanyName(name: string) {
    return !name.match(CONST.REGEX.ALL_EMOJIS);
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
 * Checks that the provided name doesn't contain special characters or numbers
 */
function isValidPersonName(value: string) {
    return /^[^\d^!#$%*=<>;{}"]+$/.test(value);
}

/**
 * Checks if the provided string includes any of the provided reserved words
 */
function doesContainReservedWord(value: string, reservedWords: typeof CONST.DISPLAY_NAME.RESERVED_NAMES): boolean {
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
function isExistingRoomName(roomName: string, reports: OnyxCollection<Report>, policyID: string | undefined): boolean {
    return Object.values(reports ?? {}).some((report) => report && policyID && report.policyID === policyID && report.reportName === roomName);
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
 * Checks if a room name is valid by checking that:
 * - It starts with a hash '#'
 * - After the first character, it contains only lowercase letters, numbers, and dashes
 */
function isValidRoomNameWithoutLimits(roomName: string): boolean {
    return CONST.REGEX.ROOM_NAME_WITHOUT_LIMIT.test(roomName);
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
    return CONST.REGEX.NUMBER.test(value);
}

/**
 * Checks that the provided accountID is a number and bigger than 0.
 */
function isValidAccountRoute(accountID: number): boolean {
    return CONST.REGEX.NUMBER.test(String(accountID)) && accountID > 0;
}

type DateTimeValidationErrorKeys = {
    dateValidationErrorKey: string;
    timeValidationErrorKey: string;
};
/**
 * Validates that the date and time are at least one minute in the future.
 * data - A date and time string in 'YYYY-MM-DD HH:mm:ss.sssZ' format
 * returns an object containing the error messages for the date and time
 */
const validateDateTimeIsAtLeastOneMinuteInFuture = (translate: LocalizedTranslate, data: string): DateTimeValidationErrorKeys => {
    if (!data) {
        return {
            dateValidationErrorKey: '',
            timeValidationErrorKey: '',
        };
    }
    const parsedInputData = parseISO(data);

    const dateValidationErrorKey = DateUtils.getDayValidationErrorKey(translate, parsedInputData);
    const timeValidationErrorKey = DateUtils.getTimeValidationErrorKey(translate, parsedInputData);
    return {
        dateValidationErrorKey,
        timeValidationErrorKey,
    };
};

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

/**
 * Validates the given value if it is correct percentage value.
 */
function isValidPercentage(value: string): boolean {
    const parsedValue = Number(value);
    return !Number.isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100;
}

/**
 * Validates the given value if it is correct tax name.
 */
function isExistingTaxName(taxName: string, taxRates: TaxRates): boolean {
    const trimmedTaxName = taxName.trim();
    return !!Object.values(taxRates).find((taxRate) => taxRate.name === trimmedTaxName);
}

function isExistingTaxCode(taxCode: string, taxRates: TaxRates): boolean {
    const trimmedTaxCode = taxCode.trim();
    return !!Object.keys(taxRates).find((taxID) => taxID === trimmedTaxCode);
}

/**
 * Validates the given value if it is correct subscription size.
 */
function isValidSubscriptionSize(subscriptionSize: string): boolean {
    const parsedSubscriptionSize = Number(subscriptionSize);
    return !Number.isNaN(parsedSubscriptionSize) && parsedSubscriptionSize > 0 && parsedSubscriptionSize <= CONST.SUBSCRIPTION_SIZE_LIMIT && Number.isInteger(parsedSubscriptionSize);
}

/**
 * Validates the given value if it is correct email address.
 * @param email
 */
function isValidEmail(email: string): boolean {
    return Str.isValidEmail(email);
}

/**
 * Validates the given value if it is correct phone number in E164 format (international standard).
 * @param phoneNumber
 */
function isValidPhoneInternational(phoneNumber: string): boolean {
    const parsedPhoneNumber = parsePhoneNumber(phoneNumber);

    return parsedPhoneNumber.possible && Str.isValidE164Phone(parsedPhoneNumber.number?.e164 ?? '');
}

/**
 * Validates the given value if it is correct zip code for international addresses.
 * @param zipCode
 */
function isValidZipCodeInternational(zipCode: string): boolean {
    return /^[a-z0-9][a-z0-9\- ]{0,10}[a-z0-9]$/.test(zipCode);
}

/**
 * Validates the given value if it is correct ownership percentage
 * @param value
 * @param totalOwnedPercentage
 * @param ownerBeingModifiedID
 */
function isValidOwnershipPercentage(value: string, totalOwnedPercentage: Record<string, number>, ownerBeingModifiedID: string): boolean {
    const parsedValue = Number(value);
    const isValidNumber = !Number.isNaN(parsedValue) && parsedValue >= 25 && parsedValue <= 100;

    let totalOwnedPercentageSum = 0;
    const totalOwnedPercentageKeys = Object.keys(totalOwnedPercentage);
    for (const key of totalOwnedPercentageKeys) {
        if (key === ownerBeingModifiedID) {
            continue;
        }

        totalOwnedPercentageSum += totalOwnedPercentage[key];
    }

    const isTotalSumValid = totalOwnedPercentageSum + parsedValue <= 100;

    return isValidNumber && isTotalSumValid;
}

/**
 * Validates the given value if it is correct ABN number - https://abr.business.gov.au/Help/AbnFormat
 * @param registrationNumber - number to validate.
 */
function isValidABN(registrationNumber: string): boolean {
    const cleanedAbn: string = registrationNumber.replaceAll(/[ _]/g, '');
    if (cleanedAbn.length !== 11) {
        return false;
    }

    const weights: number[] = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    const checksum: number = [...cleanedAbn].reduce((total: number, char: string, index: number) => {
        let digit = Number(char);
        if (index === 0) {
            digit--;
        } // First digit special rule
        return total + digit * (weights.at(index) ?? 0); // Using optional chaining for safety
    }, 0);

    return checksum % 89 === 0;
}

/**
 * Validates the given value if it is correct ACN number - https://asic.gov.au/for-business/registering-a-company/steps-to-register-a-company/australian-company-numbers/australian-company-number-digit-check/
 * @param registrationNumber - number to validate.
 */
function isValidACN(registrationNumber: string): boolean {
    const cleanedAcn: string = registrationNumber.replaceAll(/\s|-/g, '');
    if (cleanedAcn.length !== 9 || Number.isNaN(Number(cleanedAcn))) {
        return false;
    }

    const weights: number[] = [8, 7, 6, 5, 4, 3, 2, 1];
    const tally: number = weights.reduce((total: number, weight: number, index: number) => {
        return total + Number(cleanedAcn[index]) * weight;
    }, 0);

    const checkDigit: number = 10 - (tally % 10);
    return checkDigit === Number(cleanedAcn[8]) || (checkDigit === 10 && Number(cleanedAcn[8]) === 0);
}

/**
 * Validates the given value if it is correct australian registration number.
 * @param registrationNumber
 */
function isValidAURegistrationNumber(registrationNumber: string): boolean {
    return isValidABN(registrationNumber) || isValidACN(registrationNumber);
}

/**
 * Validates the given value if it is correct british registration number.
 * @param registrationNumber
 */
function isValidGBRegistrationNumber(registrationNumber: string): boolean {
    return /^(?:\d{8}|[A-Z]{2}\d{6})$/.test(registrationNumber);
}

/**
 * Validates the given value if it is correct canadian registration number.
 * @param registrationNumber
 */
function isValidCARegistrationNumber(registrationNumber: string): boolean {
    return /^\d{9}(?:[A-Z]{2}\d{4})?$/.test(registrationNumber);
}

type EUCountry = keyof typeof CONST.ALL_EUROPEAN_UNION_COUNTRIES;

/**
 * Validates the given value if it is EU member country
 * @param country
 */
function isEUMember(country: Country | ''): boolean {
    return country in CONST.ALL_EUROPEAN_UNION_COUNTRIES;
}

/**
 * Validates the given values if its is correct registration number for given EU member country
 * @param registrationNumber
 * @param country
 */
function isValidEURegistrationNumber(registrationNumber: string, country: EUCountry): boolean {
    const regex = CONST.EU_REGISTRATION_NUMBER_REGEX[country];
    return !!regex && regex.test(registrationNumber);
}

/**
 * Validates the given value if it is correct registration number for the given country.
 * @param registrationNumber
 * @param country
 */
function isValidRegistrationNumber(registrationNumber: string, country: Country | '') {
    if (isEUMember(country)) {
        return isValidEURegistrationNumber(registrationNumber, country as EUCountry);
    }

    switch (country) {
        case CONST.COUNTRY.AU:
            return isValidAURegistrationNumber(registrationNumber);
        case CONST.COUNTRY.GB:
            return isValidGBRegistrationNumber(registrationNumber);
        case CONST.COUNTRY.CA:
            return isValidCARegistrationNumber(registrationNumber);
        case CONST.COUNTRY.US:
            return isValidTaxID(registrationNumber);
        default:
            return true;
    }
}

/**
 * Checks if the `inputValue` byte length exceeds the specified byte length,
 * returning `isValid` (boolean) and `byteLength` (number) to be used in dynamic error copy.
 */
function isValidInputLength(inputValue: string, byteLength: number) {
    const valueByteLength = StringUtils.getUTF8ByteLength(inputValue);
    return {isValid: valueByteLength <= byteLength, byteLength: valueByteLength};
}

/**
 * Checks if a string contains HTML-like tags in the format <...>.
 * Individual < or > characters are allowed.
 */
function containsHTMLTags(value: string): boolean {
    return /<[^>]+>/g.test(value);
}

/**
 * Validates the given value as a U.S. Employer Identification Number (EIN).
 * Format: XX-XXXXXXX
 * @param ein - The EIN to validate.
 */
function isValidEIN(ein: string): boolean {
    return /^\d{2}-\d{7}$/.test(ein);
}

/**
 * Validates the given value as a UK VAT Registration Number (VRN).
 * Format: Optional "GB" prefix followed by 9 digits.
 * @param vrn - The VRN to validate.
 */
function isValidVRN(vrn: string): boolean {
    return /^(GB)?\d{9}$/.test(vrn);
}

/**
 * Validates the given value as a Canadian Business Number (BN).
 * Format: 9 digits, optionally followed by a 2-letter program ID and 4-digit reference number.
 * Valid program IDs include: RT, RC, RM, RP, etc.
 * @param bn - The Business Number to validate.
 */
function isValidBN(bn: string): boolean {
    return /^\d{9}([A-Z]{2}\d{4})?$/.test(bn);
}

/**
 * Validates the given value as a European Union VAT Number.
 * Format: Two-letter country code followed by 8–12 alphanumeric characters.
 * @param vat - The VAT number to validate.
 * @returns True if the value is a valid EU VAT number; otherwise, false.
 */
function isValidEUVATNumber(vat: string): boolean {
    return /^[A-Z]{2}[A-Z0-9]{8,12}$/.test(vat);
}

/**
 * Validates the given value as a country-specific tax identification number.
 * Delegates to the appropriate country-specific validation function.
 * @param number - The tax ID number to validate.
 * @param country - The country code (e.g., 'US', 'GB', 'CA', 'AU').
 */
function isValidTaxIDEINNumber(number: string, country: Country | '') {
    switch (country) {
        case CONST.COUNTRY.AU:
            return isValidABN(number);
        case CONST.COUNTRY.GB:
            return isValidVRN(number);
        case CONST.COUNTRY.CA:
            return isValidBN(number);
        case CONST.COUNTRY.US:
            return isValidEIN(number);
        default:
            return isValidEUVATNumber(number);
    }
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
    isValidPaymentZipCode,
    isRequiredFulfilled,
    getFieldRequiredErrors,
    isValidUSPhone,
    isValidPhoneNumber,
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
    isValidRoomNameWithoutLimits,
    isValidTaxID,
    isValidValidateCode,
    isValidCompanyName,
    isValidDisplayName,
    isValidLegalName,
    doesContainReservedWord,
    isNumeric,
    isValidAccountRoute,
    getDatePassedError,
    isValidRecoveryCode,
    validateDateTimeIsAtLeastOneMinuteInFuture,
    prepareValues,
    isValidPersonName,
    isValidPercentage,
    isExistingTaxName,
    isValidSubscriptionSize,
    isExistingTaxCode,
    isPublicDomain,
    isValidEmail,
    isValidPhoneInternational,
    isValidZipCodeInternational,
    isValidOwnershipPercentage,
    isValidRegistrationNumber,
    isValidInputLength,
    isValidTaxIDEINNumber,
    containsHTMLTags,
};
