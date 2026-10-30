import formatDynamicFieldValue from '@components/DynamicForm/utils/formatDynamicFieldValue';
import getConfirmationItems from '@components/DynamicForm/utils/getConfirmationItems';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import getDynamicFieldErrors from '@components/DynamicForm/utils/getDynamicFieldErrors';
import getVisibleFields from '@components/DynamicForm/utils/getVisibleFields';
import isSupportedField from '@components/DynamicForm/utils/isSupportedField';
import {getAllFields, getPages} from '@components/DynamicForm/utils/paginate';

import US from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/forms/US';

import CONST from '@src/CONST';
import type {DynamicFormField} from '@src/types/onyx';

import {translateLocal} from '../../../../../utils/TestHelper';

const PAGES = getPages(US);
const ALL_FIELDS = getAllFields(PAGES);
const BUSINESS_PAGE = PAGES.find((page) => page.key === 'business');
const BUSINESS_FIELDS = getContentFields(BUSINESS_PAGE?.content ?? []);
const REPRESENTATIVE_PAGE = PAGES.find((page) => page.key === 'representative');
const REPRESENTATIVE_FIELDS = getContentFields(REPRESENTATIVE_PAGE?.content ?? []).filter(isSupportedField);

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
    it('asks only for what the admin can act on, with the legal name read-only', () => {
        // Given the business page of the US form

        // When its fields are listed
        const fields = BUSINESS_FIELDS.map((field) => [field.key, !!field.readonly]);

        // Then the website, tax ID and address the bank account already holds are left out, and only the admin's own answers can be edited
        expect(fields).toEqual([
            ['companyName', true],
            ['companyType', false],
            ['companyRole', false],
            ['industryCategories', false],
            ['description', false],
        ]);
    });

    it('asks for the SSN and an ID document until the representative taps that they do not have an SSN', () => {
        // Given the representative page, which the prefill starts with the "I don't have a social security number" link off

        // When the page is checked before Next, with the link off and then on
        const withSSNErrors = getDynamicFieldErrors(REPRESENTATIVE_FIELDS, {hasNoSSN: false}, translateLocal, ALL_FIELDS);
        const withoutSSNErrors = getDynamicFieldErrors(REPRESENTATIVE_FIELDS, {hasNoSSN: true}, translateLocal, ALL_FIELDS);
        const withSSNKeys = getVisibleFields(REPRESENTATIVE_FIELDS, {hasNoSSN: false}, ALL_FIELDS).map((field) => field.key);
        const withoutSSNKeys = getVisibleFields(REPRESENTATIVE_FIELDS, {hasNoSSN: true}, ALL_FIELDS).map((field) => field.key);

        // Then both are required while the link is off, and both are hidden and not asked once it is on, since Wise then runs its own ID check
        expect(withSSNErrors).toHaveProperty('ssn');
        expect(withSSNErrors).toHaveProperty('idDocument');
        expect(withSSNKeys).toEqual(expect.arrayContaining(['ssn', 'idDocument']));
        expect(withoutSSNErrors).not.toHaveProperty('ssn');
        expect(withoutSSNErrors).not.toHaveProperty('idDocument');
        expect(withoutSSNKeys).not.toContain('ssn');
        expect(withoutSSNKeys).not.toContain('idDocument');
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

    it('shows an industry category by its translated name', () => {
        // Given an industry category answer, stored as Wise's key
        const values = {industryCategories: ['SOFTWARE_DEVELOPMENT_PUBLISHING']};

        // When the confirmation row shows it
        const category = formatDynamicFieldValue(getBusinessField('industryCategories'), values, translateLocal);

        // Then the row shows the translated name, which the test translations give as its path, instead of a name made from the key
        expect(category).toBe('walletPage.wiseOnboarding.business.industryCategoryOptions.SOFTWARE_DEVELOPMENT_PUBLISHING');
    });

    it('lists the read-only rows on the confirmation page without a way to edit them', () => {
        // Given the bank account details and the admin's answers
        const values = {companyName: 'Boulder Development Inc.', ...EDITABLE_ANSWERS};

        // When the confirmation page lists the business section
        const groups = getConfirmationItems(PAGES, ALL_FIELDS, values, translateLocal, jest.fn(), jest.fn());
        const businessRows = groups.find((group) => group.id === 'business')?.rows ?? [];

        // Then every business key has a row, and only the admin's own answers open the page to edit
        expect(businessRows.map((row) => [row.id, 'shouldShowRightIcon' in row ? row.shouldShowRightIcon : undefined])).toEqual(BUSINESS_FIELDS.map((field) => [field.key, !field.readonly]));
    });
});
