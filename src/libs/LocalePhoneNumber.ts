import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {parsePhoneNumber} from './PhoneNumber';

let countryCodeByIPOnyx: number;
Onyx.connect({
    key: ONYXKEYS.COUNTRY_CODE,
    callback: (val) => (countryCodeByIPOnyx = val ?? 1),
});

/**
 * Returns a locally converted phone number for numbers from the same region
 * and an internationally converted phone number with the country code for numbers from other regions
 */
function formatPhoneNumber(number: string): string {
    if (!number) {
        return '';
    }

    // eslint-disable-next-line no-param-reassign
    number = number.replaceAll(' ', '\u00A0');

    // do not parse the string, if it doesn't contain the SMS domain and it's not a phone number
    if (number.indexOf(CONST.SMS.DOMAIN) === -1 && !CONST.REGEX.DIGITS_AND_PLUS.test(number)) {
        return number;
    }
    const numberWithoutSMSDomain = Str.removeSMSDomain(number);
    const parsedPhoneNumber = parsePhoneNumber(numberWithoutSMSDomain);

    // return the string untouched if it's not a phone number
    if (!parsedPhoneNumber.valid) {
        if (parsedPhoneNumber.number?.international) {
            return parsedPhoneNumber.number.international;
        }
        return numberWithoutSMSDomain;
    }

    const regionCode = parsedPhoneNumber.countryCode;

    if (regionCode === countryCodeByIPOnyx) {
        return parsedPhoneNumber.number.national;
    }

    return parsedPhoneNumber.number.international;
}

/**
 * This is a TEMPORARY function to be used until we have migrated away from using Onyx.Connect
 * Returns a locally converted phone number for numbers from the same region
 * and an internationally converted phone number with the country code for numbers from other regions
 */
function formatPhoneNumberWithCountryCode(number: string, countryCodeByIP: number): string {
    if (!number) {
        return '';
    }

    // eslint-disable-next-line no-param-reassign
    number = number.replaceAll(' ', '\u00A0');

    // do not parse the string, if it doesn't contain the SMS domain and it's not a phone number
    if (number.indexOf(CONST.SMS.DOMAIN) === -1 && !CONST.REGEX.DIGITS_AND_PLUS.test(number)) {
        return number;
    }
    const numberWithoutSMSDomain = Str.removeSMSDomain(number);
    const parsedPhoneNumber = parsePhoneNumber(numberWithoutSMSDomain);

    // return the string untouched if it's not a phone number
    if (!parsedPhoneNumber.valid) {
        if (parsedPhoneNumber.number?.international) {
            return parsedPhoneNumber.number.international;
        }
        return numberWithoutSMSDomain;
    }

    const regionCode = parsedPhoneNumber.countryCode;

    if (regionCode === countryCodeByIP) {
        return parsedPhoneNumber.number.national;
    }

    return parsedPhoneNumber.number.international;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    formatPhoneNumber,
    formatPhoneNumberWithCountryCode,
};
