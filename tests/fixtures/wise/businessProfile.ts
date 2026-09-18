import type {DynamicFormField} from '@src/types/onyx';

const REPRESENTATIVE = 'Business representative';
const BUSINESS = 'Business info';
const OWNERS = 'Owners';
const DIRECTORS = 'Directors';
const EDD = 'Enhanced due diligence';

const HIGH_RISK_CATEGORIES = ['GAMBLING', 'CRYPTO', 'ADULT'];

const personFields = (group: string): DynamicFormField[] => [
    {key: 'firstName', label: 'First name', group, type: 'text', required: true, maxLength: 100, refreshOnChange: false},
    {key: 'lastName', label: 'Last name', group, type: 'text', required: true, maxLength: 100, refreshOnChange: false},
    {key: 'dateOfBirth', label: 'Date of birth', labelKey: 'common.dob', group, type: 'date', required: true, refreshOnChange: false},
    {key: 'countryOfResidence', label: 'Country of residence', group, type: 'country', required: true, refreshOnChange: false},
    {key: 'address', label: 'Home address', group, type: 'address', required: true, refreshOnChange: false},
];

/** The App-owned US intake schema shape: the business profile, representative, owners and directors Wise's profile endpoints take */
const businessProfile: DynamicFormField[] = [
    ...personFields(REPRESENTATIVE),
    {key: 'email', label: 'Email', group: REPRESENTATIVE, type: 'text', required: true, keyboard: 'email', refreshOnChange: false},
    {key: 'phoneNumber', label: 'Phone number', group: REPRESENTATIVE, type: 'text', required: true, keyboard: 'tel', refreshOnChange: false},
    {key: 'ssn', label: 'SSN or ITIN', group: REPRESENTATIVE, type: 'text', required: true, sensitive: true, regex: '^\\d{9}$', keyboard: 'numeric', refreshOnChange: false},
    {key: 'idDocument', label: 'Photo ID', group: REPRESENTATIVE, type: 'file', required: true, maxFiles: 2, refreshOnChange: false},
    {key: 'legalName', label: 'Legal business name', group: BUSINESS, type: 'text', required: true, readonly: true, refreshOnChange: false},
    {
        key: 'companyType',
        label: 'Company type',
        group: BUSINESS,
        type: 'select',
        required: true,
        values: ['LIMITED_LIABILITY_COMPANY', 'FOR_PROFIT_CORPORATION', 'NON_PROFIT_CORPORATION', 'LIMITED_PARTNERSHIP', 'SOLE_PROPRIETORSHIP', 'TRUST', 'OTHER'].map((key) => ({
            key,
            label: key,
        })),
        refreshOnChange: false,
    },
    {
        key: 'companyRole',
        label: 'Your role',
        group: BUSINESS,
        type: 'select',
        required: true,
        values: [
            {key: 'OWNER', label: 'Owner'},
            {key: 'DIRECTOR', label: 'Director'},
            {key: 'OTHER', label: 'Other'},
        ],
        refreshOnChange: false,
    },
    {
        key: 'industry',
        label: 'Industry',
        group: BUSINESS,
        type: 'select',
        required: true,
        values: ['TECHNOLOGY', 'RETAIL', 'FINANCE', 'GAMBLING'].map((key) => ({key, label: key})),
        refreshOnChange: false,
    },
    {
        key: 'category',
        label: 'Business category',
        group: BUSINESS,
        type: 'select',
        required: true,
        dependsOn: {
            key: 'industry',
            valuesBy: {
                TECHNOLOGY: [{key: 'SOFTWARE', label: 'Software'}],
                RETAIL: [{key: 'E_COMMERCE', label: 'E-commerce'}],
                FINANCE: [{key: 'CRYPTO', label: 'Crypto'}],
                GAMBLING: [{key: 'GAMBLING', label: 'Gambling'}],
            },
        },
        refreshOnChange: false,
    },
    {key: 'description', label: 'Business description', group: BUSINESS, type: 'text', required: true, multiline: true, maxLength: 500, refreshOnChange: false},
    {key: 'website', label: 'Website', group: BUSINESS, type: 'text', required: false, keyboard: 'url', refreshOnChange: false},
    {
        key: 'owners',
        label: 'Owners',
        description: 'Only applies if 25% ownership or more',
        group: OWNERS,
        type: 'list',
        required: false,
        maxItems: 4,
        itemFields: [...personFields('Owner'), {key: 'ownershipPercentage', label: 'Ownership', group: 'Owner', type: 'percent', required: true, refreshOnChange: false}],
        refreshOnChange: false,
    },
    {
        key: 'directors',
        label: 'Directors',
        group: DIRECTORS,
        type: 'list',
        required: true,
        minItems: 1,
        itemFields: personFields('Director'),
        refreshOnChange: false,
    },
    {
        key: 'sourceOfFunds',
        label: 'Source of funds',
        group: EDD,
        type: 'select',
        required: true,
        values: ['REVENUE', 'BUSINESS_LOAN', 'INVESTMENT_INCOME', 'GRANTS'].map((key) => ({key, label: key})),
        showWhen: {key: 'category', equals: HIGH_RISK_CATEGORIES},
        refreshOnChange: false,
    },
    {
        key: 'sourceOfFundsProof',
        label: 'Proof of source of funds',
        group: EDD,
        type: 'file',
        required: true,
        maxFiles: 5,
        showWhen: {key: 'category', equals: HIGH_RISK_CATEGORIES},
        refreshOnChange: false,
    },
];

export default businessProfile;
export {HIGH_RISK_CATEGORIES};
