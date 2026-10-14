import {getAllFields, getPages} from '@components/DynamicForm/utils/paginate';

import getIndustryCategoryOptions from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/forms/getIndustryCategoryOptions';
import WISE_ONBOARDING_FORM from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseOnboardingForm';

describe('WiseOnboardingForm', () => {
    const schema = WISE_ONBOARDING_FORM.US;
    if (!schema || !('pages' in schema)) {
        throw new Error('US form missing');
    }
    const pages = getPages(schema);
    const allFields = getAllFields(pages);

    it('starts with the business page', () => {
        expect(schema.pages.map((page) => page.key)).toEqual(['business']);
    });

    it('uses a unique key for every field', () => {
        const keys = allFields.map((field) => field.key);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it('asks only for what the account does not already hold', () => {
        const asked = allFields.filter((field) => !field.readonly).map((field) => field.key);
        expect(asked).toEqual(['companyRole', 'industryCategories', 'description']);
    });

    it('offers all 152 industry categories once, with readable labels', () => {
        expect(getIndustryCategoryOptions().at(0)?.label).toBe('Growing of crops agriculture');
        const keys = getIndustryCategoryOptions().map((option) => option.key);
        expect(keys).toHaveLength(152);
        expect(new Set(keys).size).toBe(152);
    });
});
