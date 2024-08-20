import {PUBLIC_DOMAINS, Str} from 'expensify-common';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {parsePhoneNumber} from './PhoneNumber';

let countryCodeByIP: number;
Onyx.connect({
    key: ONYXKEYS.COUNTRY_CODE,
    callback: (val) => (countryCodeByIP = val ?? 1),
});

/**
 * Remove the special chars from the phone number
 */
function getPhoneNumberWithoutSpecialChars(phone: string): string {
    return phone.replace(CONST.REGEX.SPECIAL_CHARS_WITHOUT_NEWLINE, '');
}

/**
 * Append user country code to the phone number
 */
function appendCountryCode(phone: string): string {
    if (phone.startsWith('+')) {
        return phone;
    }
    const phoneWithCountryCode = `+${countryCodeByIP}${phone}`;
    if (parsePhoneNumber(phoneWithCountryCode).possible) {
        return phoneWithCountryCode;
    }
    return `+${phone}`;
}

/**
 * Check email is public domain or not
 */
function isEmailPublicDomain(email: string): boolean {
    const emailDomain = Str.extractEmailDomain(email).toLowerCase();
    return (PUBLIC_DOMAINS as readonly string[]).includes(emailDomain);
}

/**
 * Check if number is valid
 * @returns a valid phone number formatted
 */
function validateNumber(values: string): string {
    const parsedPhoneNumber = parsePhoneNumber(values);

    if (parsedPhoneNumber.possible && Str.isValidE164Phone(values.slice(0))) {
        return `${parsedPhoneNumber.number?.e164}${CONST.SMS.DOMAIN}`;
    }

    return '';
}

/**
 * Check number is valid and attach country code
 * @returns a valid phone number with country code
 */
function getPhoneLogin(partnerUserID: string): string {
    if (partnerUserID.length === 0) {
        return '';
    }

    return appendCountryCode(getPhoneNumberWithoutSpecialChars(partnerUserID));
}

/**
 * Check whether 2 emails have the same private domain
 */
function areEmailsFromSamePrivateDomain(email1: string, email2: string): boolean {
    if (isEmailPublicDomain(email1) || isEmailPublicDomain(email2)) {
        return false;
    }
    return Str.extractEmailDomain(email1).toLowerCase() === Str.extractEmailDomain(email2).toLowerCase();
}

export {getPhoneNumberWithoutSpecialChars, appendCountryCode, isEmailPublicDomain, validateNumber, getPhoneLogin, areEmailsFromSamePrivateDomain};
