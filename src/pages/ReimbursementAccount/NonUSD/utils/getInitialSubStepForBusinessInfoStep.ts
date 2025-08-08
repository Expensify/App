import {Str} from 'expensify-common';
import {
    isValidAddress,
    isValidCompanyName,
    isValidEmail,
    isValidPhoneInternational,
    isValidRegistrationNumber,
    isValidTaxIDEINNumber,
    isValidWebsite,
    isValidZipCode,
    isValidZipCodeInternational,
} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const BUSINESS_INFO_STEP_KEYS = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

function isMissingValidCompanyName(companyName: string) {
    return companyName === '' || !isValidCompanyName(companyName);
}

function isMissingValidWebsite(website: string) {
    return website === '' || !isValidWebsite(Str.sanitizeURL(website, CONST.COMPANY_WEBSITE_DEFAULT_SCHEME));
}

function isMissingValidAddress(street: string, city: string, postalCode: string, state: string, country: string) {
    return (
        street === '' ||
        city === '' ||
        postalCode === '' ||
        country === '' ||
        ((country === CONST.COUNTRY.US || country === CONST.COUNTRY.CA) && state === '') ||
        (country === '' && state === '') ||
        !isValidAddress(street) ||
        (country === CONST.COUNTRY.US && !isValidZipCodeInternational(postalCode))
    );
}

function isMissingValidBusinessContactInformation(contactNumber: string, contactEmail: string) {
    return contactNumber === '' || contactEmail === '' || !isValidPhoneInternational(contactNumber) || !isValidEmail(contactEmail);
}

function isMissingValidRegistrationNumber(registrationNumber: string, country: string) {
    return registrationNumber === '' || !isValidRegistrationNumber(registrationNumber, country as keyof typeof CONST.COUNTRY);
}

function isMissingValidTaxIDEINNumber(taxIDEINNumber: string, country: string) {
    return taxIDEINNumber === '' || !isValidTaxIDEINNumber(taxIDEINNumber, country as keyof typeof CONST.COUNTRY);
}

/**
 * Returns the initial subStep for the Business info step based on already existing data
 */
function getInitialSubStepForBusinessInfoStep(data: Record<string, string>): number {
    if (isMissingValidCompanyName(data[BUSINESS_INFO_STEP_KEYS.COMPANY_NAME])) {
        return 0;
    }

    if (isMissingValidWebsite(data[BUSINESS_INFO_STEP_KEYS.COMPANY_WEBSITE])) {
        return 1;
    }

    if (
        isMissingValidAddress(
            data[BUSINESS_INFO_STEP_KEYS.COMPANY_STREET],
            data[BUSINESS_INFO_STEP_KEYS.COMPANY_CITY],
            data[BUSINESS_INFO_STEP_KEYS.COMPANY_POSTAL_CODE],
            data[BUSINESS_INFO_STEP_KEYS.COMPANY_STATE],
            data[BUSINESS_INFO_STEP_KEYS.COMPANY_COUNTRY_CODE],
        )
    ) {
        return 2;
    }

    if (isMissingValidBusinessContactInformation(data[BUSINESS_INFO_STEP_KEYS.BUSINESS_CONTACT_NUMBER], data[BUSINESS_INFO_STEP_KEYS.BUSINESS_CONFIRMATION_EMAIL])) {
        return 3;
    }

    if (isMissingValidRegistrationNumber(data[BUSINESS_INFO_STEP_KEYS.BUSINESS_REGISTRATION_INCORPORATION_NUMBER], data[BUSINESS_INFO_STEP_KEYS.COMPANY_COUNTRY_CODE])) {
        return 4;
    }

    if (isMissingValidTaxIDEINNumber(data[BUSINESS_INFO_STEP_KEYS.TAX_ID_EIN_NUMBER], data[BUSINESS_INFO_STEP_KEYS.COMPANY_COUNTRY_CODE])) {
        return 5;
    }

    if (
        data[BUSINESS_INFO_STEP_KEYS.FORMATION_INCORPORATION_COUNTRY_CODE] === '' ||
        ((data[BUSINESS_INFO_STEP_KEYS.FORMATION_INCORPORATION_COUNTRY_CODE] === CONST.COUNTRY.US ||
            data[BUSINESS_INFO_STEP_KEYS.FORMATION_INCORPORATION_COUNTRY_CODE] === CONST.COUNTRY.CA) &&
            data[BUSINESS_INFO_STEP_KEYS.FORMATION_INCORPORATION_STATE] === '')
    ) {
        return 6;
    }

    if (data[BUSINESS_INFO_STEP_KEYS.BUSINESS_CATEGORY] === '' || data[BUSINESS_INFO_STEP_KEYS.APPLICANT_TYPE_ID] === '') {
        return 7;
    }

    if (data[BUSINESS_INFO_STEP_KEYS.ANNUAL_VOLUME] === '') {
        return 8;
    }

    if (data[BUSINESS_INFO_STEP_KEYS.TRADE_VOLUME] === '') {
        return 9;
    }

    return 10;
}

export default getInitialSubStepForBusinessInfoStep;
