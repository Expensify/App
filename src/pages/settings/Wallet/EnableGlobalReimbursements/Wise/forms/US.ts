import CONST from '@src/CONST';
import type {DynamicFormSchema} from '@src/types/onyx';

import getIndustryCategoryOptions from './getIndustryCategoryOptions';

/**
 * The US business onboarding form. Each page's key is the `step` UpdateWiseOnboardingAdditionalData saves under, and a read-only row's key
 * is the key the screen prefills it from. Pages are added one at a time with their Auth step.
 */
const US: DynamicFormSchema = {
    pages: [
        {
            key: 'business',
            titleKey: 'wiseOnboarding.business.title',
            descriptionKey: 'wiseOnboarding.business.description',
            content: [
                {key: 'companyName', type: 'text', required: true, readonly: true, labelKey: 'wiseOnboarding.business.legalName'},
                {key: 'companyTaxID', type: 'text', required: true, readonly: true, labelKey: 'wiseOnboarding.business.ein'},
                {key: 'website', type: 'text', required: true, readonly: true, labelKey: 'wiseOnboarding.business.website'},
                {
                    key: 'companyRole',
                    type: 'select',
                    required: true,
                    labelKey: 'wiseOnboarding.business.companyRole',
                    values: [
                        {key: CONST.WISE.COMPANY_ROLE.OWNER, labelKey: 'wiseOnboarding.business.companyRoleOwner'},
                        {key: CONST.WISE.COMPANY_ROLE.DIRECTOR, labelKey: 'wiseOnboarding.business.companyRoleDirector'},
                        {key: CONST.WISE.COMPANY_ROLE.OTHER, labelKey: 'wiseOnboarding.business.companyRoleOther'},
                    ],
                },
                {
                    key: 'industryCategories',
                    type: 'multiselect',
                    required: true,
                    labelKey: 'wiseOnboarding.business.industryCategories',
                    descriptionKey: 'wiseOnboarding.business.industryCategoriesDescription',
                    values: getIndustryCategoryOptions(),
                },
                {
                    key: 'description',
                    type: 'text',
                    required: true,
                    multiline: true,
                    maxLength: 1000,
                    labelKey: 'wiseOnboarding.business.businessDescription',
                },
            ],
        },
    ],
};

export default US;
