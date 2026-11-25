import CONST from '@src/CONST';

import type {ParsedPhoneNumber, PhoneNumberParseOptions} from 'awesome-phonenumber';

// eslint-disable-next-line no-restricted-imports
import {parsePhoneNumber as originalParsePhoneNumber} from 'awesome-phonenumber';
import {Str} from 'expensify-common';

// Enough for about 7,500 device contacts, which need about two entries each
const MAX_CACHED_PHONE_NUMBERS = 15000;

/**
 * Parsed numbers, by input. Parsing is slow, and the device contact import parses every contact's number again each time
 * a contact list screen gains focus. A result depends only on its input and on the phone number metadata bundled with the
 * app, so a cached result can never be stale.
 */
const parsedPhoneNumberCache = new Map<string, ParsedPhoneNumber>();

/**
 * Wraps awesome-phonenumber's parsePhoneNumber function to handle the case where we want to treat
 * a US phone number that's technically valid as invalid. eg: +115005550009.
 * See https://github.com/Expensify/App/issues/28492
 */
function parsePhoneNumber(phoneNumber: string, options?: PhoneNumberParseOptions): ParsedPhoneNumber {
    // Options change the result, and inputs with an @ are emails or SMS logins, which are cheap to reject and would fill the cache
    if (options || phoneNumber.includes('@')) {
        return parsePhoneNumberWithoutCache(phoneNumber, options);
    }

    const cachedPhoneNumber = parsedPhoneNumberCache.get(phoneNumber);
    if (cachedPhoneNumber) {
        return cachedPhoneNumber;
    }

    const parsedPhoneNumber = parsePhoneNumberWithoutCache(phoneNumber);

    // Every caller gets the same object from now on, so freeze it to keep one caller from changing it for the others
    Object.freeze(parsedPhoneNumber.number);
    Object.freeze(parsedPhoneNumber);

    if (parsedPhoneNumberCache.size >= MAX_CACHED_PHONE_NUMBERS) {
        // Maps keep insertion order, so the first key is the oldest entry
        const oldestPhoneNumber = parsedPhoneNumberCache.keys().next().value;
        if (oldestPhoneNumber !== undefined) {
            parsedPhoneNumberCache.delete(oldestPhoneNumber);
        }
    }
    parsedPhoneNumberCache.set(phoneNumber, parsedPhoneNumber);
    return parsedPhoneNumber;
}

function parsePhoneNumberWithoutCache(phoneNumber: string, options?: PhoneNumberParseOptions): ParsedPhoneNumber {
    const parsedPhoneNumber = originalParsePhoneNumber(phoneNumber, options);
    if (!parsedPhoneNumber.possible) {
        return parsedPhoneNumber;
    }

    const phoneNumberWithoutSpecialChars = phoneNumber.replaceAll(CONST.REGEX.SPECIAL_CHARS_WITHOUT_NEWLINE, '');

    if (!CONST.REGEX.PHONE_NUMBER.test(phoneNumberWithoutSpecialChars)) {
        return {
            ...parsedPhoneNumber,
            valid: false,
            possible: false,
            number: {
                ...parsedPhoneNumber.number,
                // The invalid type marks `number` optional, so set `input` here. awesome-phonenumber sets it to the raw string too.
                input: phoneNumber,
                e164: phoneNumberWithoutSpecialChars,
                international: phoneNumberWithoutSpecialChars,
                national: phoneNumberWithoutSpecialChars,
                rfc3966: `tel:${phoneNumberWithoutSpecialChars}`,
                significant: phoneNumberWithoutSpecialChars,
            },
        };
    }

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
            input: phoneNumber,

            // mimic the behavior of awesome-phonenumber
            e164: phoneNumberWithoutSpecialChars,
            international: `${countryCode} ${phoneNumberWithoutCountryCode}`,
            national: phoneNumberWithoutCountryCode,
            rfc3966: `tel:${countryCode}-${phoneNumberWithoutCountryCode}`,
            significant: phoneNumberWithoutCountryCode,
        },
    };
}

/**
 * Adds expensify SMS domain (@expensify.sms) if login is a phone number and if it's not included yet
 */
function addSMSDomainIfPhoneNumber(login = ''): string {
    // A valid email is returned unchanged below, so a login that is already on the SMS domain doesn't need parsing
    if (login.endsWith(CONST.SMS.DOMAIN) && Str.isValidEmail(login)) {
        return login;
    }

    const parsedPhoneNumber = parsePhoneNumber(login);
    if (parsedPhoneNumber.possible && !Str.isValidEmail(login)) {
        return `${parsedPhoneNumber.number?.e164}${CONST.SMS.DOMAIN}`;
    }
    return login;
}

export {parsePhoneNumber, addSMSDomainIfPhoneNumber};
