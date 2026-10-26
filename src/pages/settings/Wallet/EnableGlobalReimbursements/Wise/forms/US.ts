import CONST from '@src/CONST';
import type {DynamicFormSchema} from '@src/types/onyx';

import getIndustryCategoryOptions from './getIndustryCategoryOptions';

/** The US business onboarding form. Each page's key names the onboarding step its answers belong to. */
const US: DynamicFormSchema = {
    pages: [
        {
            key: 'representative',
            titleKey: 'walletPage.wiseOnboarding.representative.title',
            descriptionKey: 'walletPage.wiseOnboarding.representative.description',
            content: [
                {key: 'firstName', type: 'text', required: true, rule: 'legalName', labelKey: 'walletPage.wiseOnboarding.representative.legalFirstName'},
                {key: 'lastName', type: 'text', required: true, rule: 'legalName', labelKey: 'walletPage.wiseOnboarding.representative.legalLastName'},
                {key: 'phoneNumber', type: 'text', required: true, rule: 'phone', labelKey: 'common.phoneNumber'},
                {key: 'dateOfBirth', type: 'date', required: true, rule: 'dateOfBirth', labelKey: 'common.dob'},
                {key: 'address', type: 'address', required: true, labelKey: 'common.address'},
                {key: 'ssn', type: 'text', required: true, sensitive: true, regex: '^\\d{9}$', example: '123456789', labelKey: 'walletPage.wiseOnboarding.representative.ssn'},
                {
                    key: 'idDocument',
                    type: 'file',
                    required: true,
                    maxFiles: 5,
                    labelKey: 'walletPage.wiseOnboarding.representative.idDocument',
                    descriptionKey: 'walletPage.wiseOnboarding.representative.idDocumentDescription',
                },
            ],
        },
        {
            key: 'business',
            titleKey: 'walletPage.wiseOnboarding.business.title',
            content: [
                {key: 'companyName', type: 'text', required: true, readonly: true, labelKey: 'walletPage.wiseOnboarding.business.legalName'},
                {
                    key: 'companyRole',
                    type: 'select',
                    required: true,
                    labelKey: 'walletPage.wiseOnboarding.business.companyRole',
                    values: [
                        {key: CONST.WISE.COMPANY_ROLE.OWNER, labelKey: 'walletPage.wiseOnboarding.business.companyRoleOwner'},
                        {key: CONST.WISE.COMPANY_ROLE.DIRECTOR, labelKey: 'walletPage.wiseOnboarding.business.companyRoleDirector'},
                        {key: CONST.WISE.COMPANY_ROLE.OTHER, labelKey: 'walletPage.wiseOnboarding.business.companyRoleOther'},
                    ],
                },
                {
                    key: 'industryCategories',
                    type: 'multiselect',
                    required: true,
                    labelKey: 'walletPage.wiseOnboarding.business.industryCategories',
                    values: getIndustryCategoryOptions(),
                },
                {
                    key: 'description',
                    type: 'text',
                    required: true,
                    multiline: true,
                    maxLength: 1000,
                    labelKey: 'walletPage.wiseOnboarding.business.description',
                    descriptionKey: 'walletPage.wiseOnboarding.business.descriptionHint',
                },
            ],
        },
    ],
};

export default US;
