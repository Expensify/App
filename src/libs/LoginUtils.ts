import {PUBLIC_DOMAINS_SET, Str} from 'expensify-common';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {clearSignInData, setAccountError} from './actions/Session';
import Navigation from './Navigation/Navigation';
import {parsePhoneNumber} from './PhoneNumber';

/**
 * Remove the special chars from the phone number
 */
function getPhoneNumberWithoutSpecialChars(phone: string): string {
    return phone.replaceAll(CONST.REGEX.SPECIAL_CHARS_WITHOUT_NEWLINE, '');
}

/**
 * Append user country code to the phone number
 *
 * @param phone - Phone number to append country code to
 * @param countryCode - Country code (e.g., "1" for US, "44" for UK)
 * @returns Phone number with country code appended
 */
function appendCountryCode(phone: string, countryCode: number): string {
    if (phone.startsWith('+')) {
        return phone;
    }
    const phoneWithCountryCode = `+${countryCode}${phone}`;
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
    return PUBLIC_DOMAINS_SET.has(emailDomain);
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
function getPhoneLogin(partnerUserID: string, countryCode: number): string {
    if (partnerUserID.length === 0) {
        return '';
    }

    return appendCountryCode(getPhoneNumberWithoutSpecialChars(partnerUserID), countryCode);
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

function postSAMLLogin(body: FormData): Promise<Response | void> {
    return fetch(CONFIG.EXPENSIFY.SAML_URL, {
        method: CONST.NETWORK.METHOD.POST,
        body,
        credentials: 'omit',
    }).then((response) => {
        if (!response.ok) {
            throw new Error('An error occurred while logging in. Please try again');
        }
        return response.json() as Promise<Response>;
    });
}

function handleSAMLLoginError(errorMessage: string, shouldClearSignInData: boolean) {
    if (shouldClearSignInData) {
        clearSignInData();
    }

    setAccountError(errorMessage);
    Navigation.goBack(ROUTES.HOME);
}

function formatE164PhoneNumber(phoneNumber: string, countryCode: number) {
    const phoneNumberWithCountryCode = appendCountryCode(phoneNumber, countryCode);
    const parsedPhoneNumber = parsePhoneNumber(phoneNumberWithCountryCode);

    return parsedPhoneNumber.number?.e164;
}

export {
    getPhoneNumberWithoutSpecialChars,
    appendCountryCode,
    isEmailPublicDomain,
    validateNumber,
    getPhoneLogin,
    areEmailsFromSamePrivateDomain,
    postSAMLLogin,
    handleSAMLLoginError,
    formatE164PhoneNumber,
};
