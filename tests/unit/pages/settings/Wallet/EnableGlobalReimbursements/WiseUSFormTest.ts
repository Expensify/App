import formatDynamicFieldValue from '@components/DynamicForm/utils/formatDynamicFieldValue';
import getConfirmationItems from '@components/DynamicForm/utils/getConfirmationItems';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import getDynamicFieldErrors from '@components/DynamicForm/utils/getDynamicFieldErrors';
import {getAllFields, getPages} from '@components/DynamicForm/utils/paginate';

import US from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/forms/US';

import CONST from '@src/CONST';
import type {DynamicFormField} from '@src/types/onyx';

import {translateLocal} from '../../../../../utils/TestHelper';

const PAGES = getPages(US);
const ALL_FIELDS = getAllFields(PAGES);
const BUSINESS_PAGE = PAGES.find((page) => page.key === 'business');
const BUSINESS_FIELDS = getContentFields(BUSINESS_PAGE?.content ?? []);

const EDITABLE_ANSWERS = {
    companyType: CONST.WISE.COMPANY_TYPE.LIMITED_LIABILITY_COMPANY,
    companyRole: CONST.WISE.COMPANY_ROLE.OWNER,
    industryCategories: ['SOFTWARE_DEVELOPMENT_PUBLISHING'],
    description: 'Accounting software',
};

function getBusinessField(key: string): DynamicFormField {
    const field = ALL_FIELDS.find((candidate) => candidate.key === key);
    if (!field) {
        throw new Error(`The business page has no ${key} field`);
    }
    return field;
}

describe('Wise US onboarding form', () => {
    it('asks for the twelve business keys the business step saves, with the bank account details read-only', () => {
        // Given the business page of the US form

        // When its fields are listed
        const fields = BUSINESS_FIELDS.map((field) => [field.key, !!field.readonly]);

        // Then they are the business step's keys in order, and only the admin's own answers can be edited
        expect(fields).toEqual([
            ['companyName', true],
            ['companyTaxID', true],
            ['website', true],
            ['addressStreet', true],
            ['addressCity', true],
            ['addressState', true],
            ['addressZipCode', true],
            ['addressCountry', true],
            ['companyType', false],
            ['companyRole', false],
            ['industryCategories', false],
            ['description', false],
        ]);
    });

    it('lets the admin move on when the bank account details are empty, since the read-only rows cannot be filled in', () => {
        // Given a business page where only the admin's own answers are given, as for an admin who does not own the bank account

        // When the page is checked before Next
        const errors = getDynamicFieldErrors(BUSINESS_FIELDS, EDITABLE_ANSWERS, translateLocal, ALL_FIELDS);

        // Then nothing blocks it
        expect(errors).toEqual({});
    });

    it('asks for the company type when the bank account has none that maps to it', () => {
        // Given a business page without a company type
        const {companyType, ...answers} = EDITABLE_ANSWERS;

        // When the page is checked before Next
        const errors = getDynamicFieldErrors(BUSINESS_FIELDS, answers, translateLocal, ALL_FIELDS);

        // Then the company type is the only answer missing
        expect(Object.keys(errors)).toEqual(['companyType']);
    });

    it('shows the state and the country of the business by name', () => {
        // Given the business address as the bank account stores it, by code
        const values = {addressState: 'CO', addressCountry: CONST.COUNTRY.US};

        // When the read-only rows show it
        const state = formatDynamicFieldValue(getBusinessField('addressState'), values, translateLocal);
        const country = formatDynamicFieldValue(getBusinessField('addressCountry'), values, translateLocal);

        // Then the rows show the translated names, which the test translations give as their paths, while the codes stay the answers
        expect(state).toBe('allStates.CO.stateName');
        expect(country).toBe(`allCountries.${CONST.COUNTRY.US}`);
    });

    it('lists the read-only rows on the confirmation page without a way to edit them', () => {
        // Given the bank account details and the admin's answers
        const values = {companyName: 'Boulder Development Inc.', companyTaxID: '123456789', addressCountry: CONST.COUNTRY.US, ...EDITABLE_ANSWERS};

        // When the confirmation page lists the business section
        const groups = getConfirmationItems(PAGES, ALL_FIELDS, values, translateLocal, jest.fn(), jest.fn());
        const businessRows = groups.find((group) => group.id === 'business')?.rows ?? [];

        // Then every business key has a row, and only the admin's own answers open the page to edit
        expect(businessRows.map((row) => [row.id, 'shouldShowRightIcon' in row ? row.shouldShowRightIcon : undefined])).toEqual(BUSINESS_FIELDS.map((field) => [field.key, !field.readonly]));
    });
});
