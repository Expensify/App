import getInitialSubStepForBusinessInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInitialSubStepForBusinessInfoStep';

import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const keys = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const completeData: Parameters<typeof getInitialSubStepForBusinessInfoStep>[0] = {
    [keys.COMPANY_NAME]: 'Example Company',
    [keys.COMPANY_WEBSITE]: 'example.com',
    [keys.COMPANY_STREET]: '123 Main Street',
    [keys.COMPANY_CITY]: 'London',
    [keys.COMPANY_POSTAL_CODE]: 'SW1A 1AA',
    [keys.COMPANY_STATE]: '',
    [keys.COMPANY_COUNTRY_CODE]: CONST.COUNTRY.GB,
    [keys.BUSINESS_CONTACT_NUMBER]: '+442079460958',
    [keys.BUSINESS_CONFIRMATION_EMAIL]: 'accounts@example.com',
    [keys.BUSINESS_REGISTRATION_INCORPORATION_NUMBER]: '12345678',
    [keys.TAX_ID_EIN_NUMBER]: '123456789',
    [keys.FORMATION_INCORPORATION_COUNTRY_CODE]: CONST.COUNTRY.GB,
    [keys.FORMATION_INCORPORATION_STATE]: '',
    [keys.BUSINESS_CATEGORY]: 'consulting',
    [keys.APPLICANT_TYPE_ID]: 'business',
    [keys.ANNUAL_VOLUME]: '10000',
    [keys.TRADE_VOLUME]: '1000',
};

describe('getInitialSubStepForBusinessInfoStep', () => {
    it.each([
        [keys.COMPANY_NAME, 0],
        [keys.COMPANY_WEBSITE, 1],
        [keys.COMPANY_STREET, 2],
        [keys.COMPANY_CITY, 2],
        [keys.COMPANY_POSTAL_CODE, 2],
        [keys.COMPANY_COUNTRY_CODE, 2],
        [keys.BUSINESS_CONTACT_NUMBER, 3],
        [keys.BUSINESS_CONFIRMATION_EMAIL, 3],
        [keys.BUSINESS_REGISTRATION_INCORPORATION_NUMBER, 4],
        [keys.TAX_ID_EIN_NUMBER, 5],
        [keys.FORMATION_INCORPORATION_COUNTRY_CODE, 6],
        [keys.BUSINESS_CATEGORY, 7],
        [keys.APPLICANT_TYPE_ID, 7],
        [keys.ANNUAL_VOLUME, 8],
        [keys.TRADE_VOLUME, 9],
    ] as const)('returns the first incomplete step for empty %s', (key, expected) => {
        // Given all earlier steps satisfy the real validators
        const data = {...completeData, [key]: ''};

        // When just this required value is missing
        const result = getInitialSubStepForBusinessInfoStep(data);

        // Then resuming begins at that value's existing step
        expect(result).toBe(expected);
    });

    it.each([
        [CONST.COUNTRY.GB, '12345678', '123456789'],
        [CONST.COUNTRY.AU, '51824753556', '51824753556'],
        [CONST.COUNTRY.CA, '123456789', '123456789'],
        ['DE', 'HRB12345', 'DE123456789'],
        ['JP', 'registration', 'JP123456789'],
        [CONST.COUNTRY.US, '123456789', '12-3456789'],
    ] satisfies Array<[(typeof completeData)[typeof keys.COMPANY_COUNTRY_CODE], string, string]>)('accepts complete real-validator data for %s', (country, registration, tax) => {
        // Given country-specific registration and tax examples from the actual validators
        const data = {
            ...completeData,
            [keys.COMPANY_COUNTRY_CODE]: country,
            [keys.COMPANY_STATE]: 'CA',
            [keys.COMPANY_POSTAL_CODE]: '94105',
            [keys.BUSINESS_REGISTRATION_INCORPORATION_NUMBER]: registration,
            [keys.TAX_ID_EIN_NUMBER]: tax,
        };

        // When all steps are complete and a scheme-less website is sanitized
        const result = getInitialSubStepForBusinessInfoStep(data);

        // Then no completed substep is revisited
        expect(result).toBe(10);
    });

    it.each([
        {name: 'invalid company name', changes: {[keys.COMPANY_NAME]: 'Example 😀'}, expected: 0},
        {name: 'invalid website', changes: {[keys.COMPANY_WEBSITE]: 'not a website'}, expected: 1},
        {name: 'invalid street', changes: {[keys.COMPANY_STREET]: 'PO Box 123'}, expected: 2},
        {name: 'invalid phone', changes: {[keys.BUSINESS_CONTACT_NUMBER]: 'abc'}, expected: 3},
        {name: 'invalid email', changes: {[keys.BUSINESS_CONFIRMATION_EMAIL]: 'invalid'}, expected: 3},
        {name: 'invalid GB registration', changes: {[keys.BUSINESS_REGISTRATION_INCORPORATION_NUMBER]: 'invalid'}, expected: 4},
        {name: 'invalid GB tax', changes: {[keys.TAX_ID_EIN_NUMBER]: 'invalid'}, expected: 5},
        {name: 'earlier invalid company before missing volume', changes: {[keys.COMPANY_NAME]: '', [keys.ANNUAL_VOLUME]: ''}, expected: 0},
        {
            name: 'Canadian state before registration',
            changes: {[keys.COMPANY_COUNTRY_CODE]: CONST.COUNTRY.CA, [keys.COMPANY_STATE]: '', [keys.BUSINESS_REGISTRATION_INCORPORATION_NUMBER]: ''},
            expected: 2,
        },
        {
            name: 'US postal before registration',
            changes: {[keys.COMPANY_COUNTRY_CODE]: CONST.COUNTRY.US, [keys.COMPANY_STATE]: 'CA', [keys.COMPANY_POSTAL_CODE]: '!', [keys.BUSINESS_REGISTRATION_INCORPORATION_NUMBER]: ''},
            expected: 2,
        },
        {
            name: 'US EIN after valid registration',
            changes: {
                [keys.COMPANY_COUNTRY_CODE]: CONST.COUNTRY.US,
                [keys.COMPANY_STATE]: 'CA',
                [keys.COMPANY_POSTAL_CODE]: '94105',
                [keys.BUSINESS_REGISTRATION_INCORPORATION_NUMBER]: '123456789',
                [keys.TAX_ID_EIN_NUMBER]: 'invalid',
            },
            expected: 5,
        },
        {name: 'US incorporation state', changes: {[keys.FORMATION_INCORPORATION_COUNTRY_CODE]: CONST.COUNTRY.US, [keys.FORMATION_INCORPORATION_STATE]: ''}, expected: 6},
        {name: 'Canadian incorporation state', changes: {[keys.FORMATION_INCORPORATION_COUNTRY_CODE]: CONST.COUNTRY.CA, [keys.FORMATION_INCORPORATION_STATE]: ''}, expected: 6},
        {name: 'non-US postal and state', changes: {[keys.COMPANY_POSTAL_CODE]: 'not a US zip', [keys.COMPANY_STATE]: ''}, expected: 10},
        {name: 'explicit website scheme', changes: {[keys.COMPANY_WEBSITE]: 'https://example.com'}, expected: 10},
    ] satisfies Array<{name: string; changes: Partial<typeof completeData>; expected: number}>)('preserves $name priority', ({changes, expected}) => {
        // Given one country rule or earlier validation can determine where to resume
        const data = {...completeData, ...changes};

        // When the real selector evaluates its original order without validator mocks
        const result = getInitialSubStepForBusinessInfoStep(data);

        // Then the existing first-incomplete rule chooses the same substep
        expect(result).toBe(expected);
    });
});
