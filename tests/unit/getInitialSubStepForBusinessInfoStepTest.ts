import {getBusinessActivityAnswers} from '@pages/ReimbursementAccount/NonUSD/utils/getBusinessActivityAnswers';
import getInitialSubStepForBusinessInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInitialSubStepForBusinessInfoStep';

import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const {
    COMPANY_NAME,
    COMPANY_WEBSITE,
    COMPANY_STREET,
    COMPANY_CITY,
    COMPANY_POSTAL_CODE,
    COMPANY_COUNTRY_CODE,
    COMPANY_STATE,
    BUSINESS_CONTACT_NUMBER,
    BUSINESS_CONFIRMATION_EMAIL,
    BUSINESS_REGISTRATION_INCORPORATION_NUMBER,
    TAX_ID_EIN_NUMBER,
    FORMATION_INCORPORATION_COUNTRY_CODE,
    FORMATION_INCORPORATION_STATE,
    BUSINESS_CATEGORY,
    APPLICANT_TYPE_ID,
    ANNUAL_VOLUME,
    TRADE_VOLUME,
    SOURCE_OF_FUNDS,
    OTHER_SOURCE_OF_FUNDS,
    OTHER_BUSINESS_LEGAL_STRUCTURE,
    NUMBER_OF_MONTHLY_TRANSACTION,
    EXPECTED_FREQUENCY_OF_TRANSACTIONS,
    CLIENT_INTENDS_TO_USE_CORPAY_ACCOUNT_TO,
    DBA_OR_REGISTERED_TRADE_NAME,
    DATE_OF_INCORPORATION,
    IS_CLIENT_CHARITABLE_ORGANIZATION,
    IS_CLIENT_DEALER_IN_STONES_PRECIOUS_METALS,
    IS_CLIENT_HIGH_VALUE_DEALER,
    IS_CLIENT_NETWORK_MARKETING_COMPANY,
    IS_CLIENT_REAL_ESTATE_COMPANY,
    IS_CLIENT_TRAVEL_OR_TOUR_COMPANY,
    IS_CLIENT_CANNABIS_RELATED_COMPANY,
    IS_CLIENT_CRYPTO_COMPANY,
    IS_CLIENT_MSBFI,
} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

const completedBusiness = {
    [COMPANY_NAME]: 'Example Business',
    [COMPANY_WEBSITE]: 'https://example.com',
    [COMPANY_STREET]: '123 Main Street',
    [COMPANY_CITY]: 'Sydney',
    [COMPANY_POSTAL_CODE]: '2000',
    [COMPANY_COUNTRY_CODE]: CONST.COUNTRY.AU,
    [COMPANY_STATE]: '',
    [BUSINESS_CONTACT_NUMBER]: '+61412345678',
    [BUSINESS_CONFIRMATION_EMAIL]: 'owner@example.com',
    [BUSINESS_REGISTRATION_INCORPORATION_NUMBER]: '51824753556',
    [TAX_ID_EIN_NUMBER]: '51824753556',
    [FORMATION_INCORPORATION_COUNTRY_CODE]: CONST.COUNTRY.AU,
    [FORMATION_INCORPORATION_STATE]: '',
    [BUSINESS_CATEGORY]: 'other',
    [APPLICANT_TYPE_ID]: 'company',
    [ANNUAL_VOLUME]: '1',
    [TRADE_VOLUME]: '1',
    [SOURCE_OF_FUNDS]: 'income',
    [NUMBER_OF_MONTHLY_TRANSACTION]: '0',
    [EXPECTED_FREQUENCY_OF_TRANSACTIONS]: 'monthly',
    [CLIENT_INTENDS_TO_USE_CORPAY_ACCOUNT_TO]: 'send',
    [DBA_OR_REGISTERED_TRADE_NAME]: 'Example Trading',
    [DATE_OF_INCORPORATION]: '2020-01-01',
};

const answeredActivities = getBusinessActivityAnswers(
    {
        [IS_CLIENT_CHARITABLE_ORGANIZATION]: 'false',
        [IS_CLIENT_DEALER_IN_STONES_PRECIOUS_METALS]: 'false',
        [IS_CLIENT_HIGH_VALUE_DEALER]: 'false',
        [IS_CLIENT_NETWORK_MARKETING_COMPANY]: 'false',
        [IS_CLIENT_REAL_ESTATE_COMPANY]: 'false',
        [IS_CLIENT_TRAVEL_OR_TOUR_COMPANY]: 'false',
        [IS_CLIENT_CANNABIS_RELATED_COMPANY]: 'false',
        [IS_CLIENT_CRYPTO_COMPANY]: 'false',
        [IS_CLIENT_MSBFI]: 'false',
    },
    undefined,
);

describe('AU business info resume', () => {
    test('accepts all nine negative answers and zero monthly transactions', () => {
        // Given a saved AU application with every activity explicitly answered No.
        // When deciding which step to display on resumption.
        const pageIndex = getInitialSubStepForBusinessInfoStep(completedBusiness, true, answeredActivities);
        // Then it opens the final confirmation instead of forcing the customer to answer again.
        expect(pageIndex).toBe(13);
    });

    test('returns to the activities screen if one answer is still missing', () => {
        // Given one unanswered question in an otherwise complete AU application.
        const activities = {...answeredActivities, [IS_CLIENT_MSBFI]: undefined};
        // When resuming the business step.
        const pageIndex = getInitialSubStepForBusinessInfoStep(completedBusiness, true, activities);
        // Then the customer must answer that question before continuing.
        expect(pageIndex).toBe(12);
    });

    test('returns to funding when the selected Other source has no explanation', () => {
        // Given an AU application whose Corpay source of funds is Others without its required explanation.
        const data = {...completedBusiness, [SOURCE_OF_FUNDS]: 'Others', [OTHER_SOURCE_OF_FUNDS]: ''};
        // When deciding where the saved application should resume.
        const pageIndex = getInitialSubStepForBusinessInfoStep(data, true, answeredActivities);
        // Then the customer must provide the missing explanation before confirmation.
        expect(pageIndex).toBe(10);
    });

    test('returns to funding when the selected Other legal structure has no explanation', () => {
        // Given an AU application whose Corpay applicant type is Other without its required explanation.
        const data = {...completedBusiness, [APPLICANT_TYPE_ID]: 'Other', [OTHER_BUSINESS_LEGAL_STRUCTURE]: ''};
        // When deciding where the saved application should resume.
        const pageIndex = getInitialSubStepForBusinessInfoStep(data, true, answeredActivities);
        // Then the customer must provide the missing legal structure before confirmation.
        expect(pageIndex).toBe(10);
    });
});
