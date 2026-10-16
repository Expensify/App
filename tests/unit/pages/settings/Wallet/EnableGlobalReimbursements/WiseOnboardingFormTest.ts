import {getAllFields, getPages} from '@components/DynamicForm/utils/paginate';

import getIndustryCategoryOptions from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/forms/getIndustryCategoryOptions';
import {getKYCRequirementPage} from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/kycRequirementLayouts';
import WISE_ONBOARDING_FORM, {getWiseOnboardingForm} from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseOnboardingForm';

import CONST from '@src/CONST';

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

    it('adds a page for each requirement the server asks us to pre-collect, in order', () => {
        // Given a US business the server flagged as high risk, so it lists the two source-of-wealth requirements for pre-collection
        const preCollected = [
            {key: 'BUSINESS_SOURCE_OF_WEALTH_INFO', state: 'NOT_PROVIDED', hostedOnly: false, requestedBy: 'EXPENSIFY'},
            {key: 'BUSINESS_SOURCE_OF_WEALTH_PROOF', state: 'NOT_PROVIDED', hostedOnly: false, requestedBy: 'EXPENSIFY'},
        ] as const;
        // Then the two requirement pages follow the profile pages, keyed by Wise's requirement type so they save under requirements
        const flagged = getWiseOnboardingForm('US', [...preCollected]);
        expect(flagged && 'pages' in flagged ? flagged.pages.map((page) => page.key) : []).toEqual(['business', 'BUSINESS_SOURCE_OF_WEALTH_INFO', 'BUSINESS_SOURCE_OF_WEALTH_PROOF']);

        // Given nothing to pre-collect, or only requirements Wise asked for after Submit
        expect(getWiseOnboardingForm('US', undefined)).toEqual(WISE_ONBOARDING_FORM.US);
        const live = [{key: 'BUSINESS_SOURCE_OF_WEALTH_PROOF', state: 'REJECTED', hostedOnly: false, requestedBy: 'WISE'}] as const;
        // Then the intake is the profile pages alone; Wise's requests belong to the follow-up list
        expect(getWiseOnboardingForm('US', [...live])).toEqual(WISE_ONBOARDING_FORM.US);
    });

    it("offers Wise's document types on the proof page", () => {
        // Given the proof page
        const proof = getKYCRequirementPage({key: CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_PROOF, state: 'NOT_PROVIDED', hostedOnly: false, requestedBy: 'EXPENSIFY'});
        const documentType = proof?.content.find((item) => 'type' in item && item.key === 'documentType');
        // Then the document kind picker lists every documentType Wise accepts, once
        const keys = documentType && 'values' in documentType ? (documentType.values ?? []).map((option) => option.key) : [];
        expect(keys).toEqual(Object.values(CONST.WISE.SOURCE_OF_WEALTH_DOCUMENT_TYPE));
    });

    it('opens the embedded page for a requirement the App has no layout for', () => {
        // Given a requirement Wise can only collect itself, and one the App does not know
        expect(getKYCRequirementPage({key: 'LIVENESS_CHECK', state: 'NOT_PROVIDED', hostedOnly: true, requestedBy: 'WISE'})).toBeUndefined();
        expect(getKYCRequirementPage({key: 'BUSINESS_ULTIMATE_BENEFICIAL_OWNER_ID', state: 'NOT_PROVIDED', hostedOnly: false, requestedBy: 'WISE'})).toBeUndefined();
    });

    it('offers all 152 industry categories once, with readable labels', () => {
        expect(getIndustryCategoryOptions().at(0)?.label).toBe('Growing of crops agriculture');
        const keys = getIndustryCategoryOptions().map((option) => option.key);
        expect(keys).toHaveLength(152);
        expect(new Set(keys).size).toBe(152);
    });
});
