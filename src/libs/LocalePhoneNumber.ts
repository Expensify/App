import CONST from '@src/CONST';

import {Str} from 'expensify-common';

import {parsePhoneNumber} from './PhoneNumber';

let countryCodeByIP: number = CONST.DEFAULT_COUNTRY_CODE;

function setCountryCodeByIP(value: number) {
    countryCodeByIP = value;
}

/**
 * Returns a locally converted phone number for numbers from the same region
 * and an internationally converted phone number with the country code for numbers from other regions
 */
function formatPhoneNumber(number: string): string {
    return formatPhoneNumberWithCountryCode(number, countryCodeByIP);
}

/**
 * This is a TEMPORARY function to be used until we have migrated away from using Onyx.Connect
 * Returns a locally converted phone number for numbers from the same region
 * and an internationally converted phone number with the country code for numbers from other regions
 */
function formatPhoneNumberWithCountryCode(number: string, countryCodeByIPValue: number): string {
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

    if (regionCode === countryCodeByIPValue) {
        return parsedPhoneNumber.number.national;
    }

    return parsedPhoneNumber.number.international;
}

export {formatPhoneNumber, formatPhoneNumberWithCountryCode, setCountryCodeByIP};
