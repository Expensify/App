// eslint-disable-next-line no-restricted-imports
import {parsePhoneNumber as originalParsePhoneNumber} from 'awesome-phonenumber';
import type {ParsedPhoneNumber, ParsedPhoneNumberInvalid, PhoneNumberParseOptions} from 'awesome-phonenumber';
import {Str} from 'expensify-common';
import CONST from '@src/CONST';
import {appendCountryCode} from './LoginUtils';

/**
 * Wraps awesome-phonenumber's parsePhoneNumber function to handle the case where we want to treat
 * a US phone number that's technically valid as invalid. eg: +115005550009.
 * See https://github.com/Expensify/App/issues/28492
 */
function parsePhoneNumber(phoneNumber: string, options?: PhoneNumberParseOptions): ParsedPhoneNumber {
    const parsedPhoneNumber = originalParsePhoneNumber(phoneNumber, options);
    if (!parsedPhoneNumber.possible) {
        return parsedPhoneNumber;
    }

    const phoneNumberWithoutSpecialChars = phoneNumber.replace(CONST.REGEX.SPECIAL_CHARS_WITHOUT_NEWLINE, '');
    if (!/^\+11[0-9]{10}$/.test(phoneNumberWithoutSpecialChars)) {
        return parsedPhoneNumber;
    }

    const countryCode = phoneNumberWithoutSpecialChars.substring(0, 2);
    const phoneNumberWithoutCountryCode = phoneNumberWithoutSpecialChars.substring(2);

    return {
        ...parsedPhoneNumber,
        valid: false,
        possible: false,
        number: {
            ...parsedPhoneNumber.number,

            // mimic the behavior of awesome-phonenumber
            e164: phoneNumberWithoutSpecialChars,
            international: `${countryCode} ${phoneNumberWithoutCountryCode}`,
            national: phoneNumberWithoutCountryCode,
            rfc3966: `tel:${countryCode}-${phoneNumberWithoutCountryCode}`,
            significant: phoneNumberWithoutCountryCode,
        },
    } as ParsedPhoneNumberInvalid;
}

/**
 * Adds expensify SMS domain (@expensify.sms) if login is a phone number and if it's not included yet
 */
function addSMSDomainIfPhoneNumber(login = ''): string {
    const parsedPhoneNumber = parsePhoneNumber(login);
    if (parsedPhoneNumber.possible && !Str.isValidEmail(login)) {
        return `${parsedPhoneNumber.number?.e164}${CONST.SMS.DOMAIN}`;
    }
    return login;
}

function sanitizePhoneNumber(num?: string) {
    return num?.replace(CONST.SANITIZE_PHONE_REGEX, '') ?? '';
}

function formatPhoneNumber(num: string) {
    const phoneNumberWithCountryCode = appendCountryCode(sanitizePhoneNumber(num));
    const parsedPhoneNumber = parsePhoneNumber(phoneNumberWithCountryCode);

    return parsedPhoneNumber;
}

function isValidPhoneNumber(phoneNumber: string): boolean {
    const sanitizedPhoneNumber = sanitizePhoneNumber(phoneNumber);
    const phoneNumberWithCountryCode = appendCountryCode(sanitizedPhoneNumber);
    const parsedPhoneNumber = formatPhoneNumber(sanitizedPhoneNumber);

    return (
        CONST.ACCEPTED_PHONE_CHARACTER_REGEX.test(phoneNumber) &&
        !CONST.REPEATED_SPECIAL_CHAR_PATTERN.test(phoneNumber) &&
        !!(parsedPhoneNumber?.possible && Str.isValidE164Phone(phoneNumberWithCountryCode))
    );
}

// eslint-disable-next-line import/prefer-default-export
export {parsePhoneNumber, addSMSDomainIfPhoneNumber, isValidPhoneNumber, sanitizePhoneNumber};
