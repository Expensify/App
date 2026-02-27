// eslint-disable-next-line no-restricted-imports
import {parsePhoneNumber as originalParsePhoneNumber} from 'awesome-phonenumber';
import type {ParsedPhoneNumber, ParsedPhoneNumberInvalid, PhoneNumberParseOptions} from 'awesome-phonenumber';
import {Str} from 'expensify-common';
import CONST from '@src/CONST';

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

    const phoneNumberWithoutSpecialChars = phoneNumber.replaceAll(CONST.REGEX.SPECIAL_CHARS_WITHOUT_NEWLINE, '');

    if (!CONST.REGEX.PHONE_NUMBER.test(phoneNumberWithoutSpecialChars)) {
        return {
            ...parsedPhoneNumber,
            valid: false,
            possible: false,
            number: {
                ...parsedPhoneNumber.number,
                e164: phoneNumberWithoutSpecialChars,
                international: phoneNumberWithoutSpecialChars,
                national: phoneNumberWithoutSpecialChars,
                rfc3966: `tel:${phoneNumberWithoutSpecialChars}`,
                significant: phoneNumberWithoutSpecialChars,
            },
        } as ParsedPhoneNumberInvalid;
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

// eslint-disable-next-line import/prefer-default-export
export {parsePhoneNumber, addSMSDomainIfPhoneNumber};
