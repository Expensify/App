import CONST from '@src/CONST';
import type {DynamicFormPage, DynamicFormSchema} from '@src/types/onyx';

import getIndustryCategoryOptions from './getIndustryCategoryOptions';

/** The person who represents the business */
const representativePage: DynamicFormPage = {
    key: 'representative',
    titleKey: 'walletPage.wiseOnboarding.representative.title',
    descriptionKey: 'walletPage.wiseOnboarding.representative.description',
    content: [
        {key: 'firstName', type: 'text', required: true, rule: 'legalName', labelKey: 'walletPage.wiseOnboarding.representative.legalFirstName'},
        {key: 'lastName', type: 'text', required: true, rule: 'legalName', labelKey: 'walletPage.wiseOnboarding.representative.legalLastName'},
        {key: 'phoneNumber', type: 'text', required: true, rule: 'phone', labelKey: 'common.phoneNumber'},
        {key: 'dateOfBirth', type: 'date', required: true, rule: 'dateOfBirth', labelKey: 'common.dob'},
        {key: 'address', type: 'address', required: true, labelKey: 'common.address'},
        {
            key: 'ssn',
            type: 'text',
            required: true,
            sensitive: true,
            regex: '^\\d{9}$',
            example: '123456789',
            labelKey: 'walletPage.wiseOnboarding.representative.ssn',
            showWhen: {key: 'hasNoSSN', equals: ['false']},
        },
        // The prefill starts it off, since an unanswered link would hide the SSN and ID document too
        {
            key: 'hasNoSSN',
            type: 'boolean',
            presentation: 'link',
            required: false,
            labelKey: 'walletPage.wiseOnboarding.representative.hasNoSSN',
            toggledLabelKey: 'walletPage.wiseOnboarding.representative.hasSSN',
        },
        // Without an SSN, Wise runs its own ID check, so the document is not asked twice
        {
            key: 'idDocument',
            type: 'file',
            required: true,
            showWhen: {key: 'hasNoSSN', equals: ['false']},
            maxFiles: 5,
            labelKey: 'walletPage.wiseOnboarding.representative.idDocument',
            descriptionKey: 'walletPage.wiseOnboarding.representative.idDocumentDescription',
        },
    ],
};

/** The business itself. The bank account already holds its website, tax ID and address, so only what the admin can act on is asked */
const businessPage: DynamicFormPage = {
    key: 'business',
    titleKey: 'walletPage.wiseOnboarding.business.title',
    content: [
        // Shown but never edited here, so it is clear which business is onboarding
        {key: 'companyName', type: 'text', required: true, readonly: true, labelKey: 'walletPage.wiseOnboarding.business.legalName'},
        {
            key: 'companyType',
            type: 'select',
            required: true,
            labelKey: 'walletPage.wiseOnboarding.business.companyType',
            values: [
                {key: CONST.WISE.COMPANY_TYPE.LIMITED_LIABILITY_COMPANY, labelKey: 'walletPage.wiseOnboarding.business.companyTypeLimitedLiabilityCompany'},
                {key: CONST.WISE.COMPANY_TYPE.FOR_PROFIT_CORPORATION, labelKey: 'walletPage.wiseOnboarding.business.companyTypeForProfitCorporation'},
                {key: CONST.WISE.COMPANY_TYPE.NON_PROFIT_CORPORATION, labelKey: 'walletPage.wiseOnboarding.business.companyTypeNonProfitCorporation'},
                {key: CONST.WISE.COMPANY_TYPE.SOLE_PROPRIETORSHIP, labelKey: 'walletPage.wiseOnboarding.business.companyTypeSoleProprietorship'},
                {key: CONST.WISE.COMPANY_TYPE.GENERAL_PARTNERSHIP, labelKey: 'walletPage.wiseOnboarding.business.companyTypeGeneralPartnership'},
                {key: CONST.WISE.COMPANY_TYPE.LIMITED_PARTNERSHIP, labelKey: 'walletPage.wiseOnboarding.business.companyTypeLimitedPartnership'},
                {key: CONST.WISE.COMPANY_TYPE.LIMITED_LIABILITY_PARTNERSHIP, labelKey: 'walletPage.wiseOnboarding.business.companyTypeLimitedLiabilityPartnership'},
                {key: CONST.WISE.COMPANY_TYPE.TRUST, labelKey: 'walletPage.wiseOnboarding.business.companyTypeTrust'},
                {key: CONST.WISE.COMPANY_TYPE.OTHER, labelKey: 'walletPage.wiseOnboarding.business.companyTypeOther'},
            ],
        },
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
};

/** The US business onboarding form. Each page's key names the onboarding step its answers belong to. */
const US: DynamicFormSchema = {
    pages: [representativePage, businessPage],
};

export default US;
