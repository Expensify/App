// eslint-disable-next-line no-restricted-imports
import {parsePhoneNumber as originalParsePhoneNumber, ParsedPhoneNumber, PhoneNumberParseOptions} from 'awesome-phonenumber';
import CONST from '@src/CONST';

/**
 * Wraps awesome-phonenumber's parsePhoneNumber function to handle the case where we want to treat
 * a US phone number that's technically valid as invalid. eg: +115005550009.
 * See https://github.com/Expensify/App/issues/28492
 */
function parsePhoneNumber(phoneNumber: string, options?: PhoneNumberParseOptions): ParsedPhoneNumber {
    const parsedPhoneNumber = originalParsePhoneNumber(phoneNumber, options);
    if (!parsedPhoneNumber.possible || !parsedPhoneNumber.valid) {
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
    };
}

// eslint-disable-next-line no-restricted-imports
export * from 'awesome-phonenumber';
export {parsePhoneNumber};
