import type {DynamicFormField} from '@src/types/onyx';

const GROUP = 'Requirement';

const options = (keys: string[]) => keys.map((key) => ({key, label: key}));

const file = (key: string, label: string, maxFiles = 1): DynamicFormField => ({key, label, group: GROUP, type: 'file', required: true, maxFiles, refreshOnChange: false});
const select = (key: string, label: string, values: string[]): DynamicFormField => ({
    key,
    label,
    group: GROUP,
    type: 'select',
    required: true,
    values: options(values),
    refreshOnChange: false,
});
const multiselect = (key: string, label: string, values: string[]): DynamicFormField => ({
    key,
    label,
    group: GROUP,
    type: 'multiselect',
    required: true,
    values: options(values),
    refreshOnChange: false,
});
const amount = (key: string, label: string): DynamicFormField => ({key, label, group: GROUP, type: 'amount', required: true, currencyKey: 'currency', refreshOnChange: false});
const text = (key: string, label: string, extra: Partial<DynamicFormField> = {}): DynamicFormField => ({
    key,
    label,
    group: GROUP,
    type: 'text',
    required: true,
    refreshOnChange: false,
    ...extra,
});

const SOURCE_OF_WEALTH = ['REVENUE', 'PERSONAL_FUNDING', 'BUSINESS_LOAN', 'FUNDING_AND_SHAREHOLDER_INVESTMENTS', 'INVESTMENT_INCOME', 'DONATIONS', 'GRANTS', 'LEGAL'];
const DOCUMENT_TYPES = ['PASSPORT', 'ID_CARD', 'DRIVERS_LICENSE', 'TAX_ID', 'RESIDENCE_PERMIT'];
const TWO_SIDED = ['ID_CARD', 'DRIVERS_LICENSE', 'TAX_ID', 'RESIDENCE_PERMIT'];

const idDocumentFields = (prefix: string): DynamicFormField[] => [
    {key: `${prefix}issuingCountry`, label: 'Issuing country', labelKey: 'common.country', group: GROUP, type: 'country', required: true, refreshOnChange: false},
    select(`${prefix}documentType`, 'Document type', DOCUMENT_TYPES),
    {...file(`${prefix}passportFile`, 'Passport photo page'), showWhen: {key: `${prefix}documentType`, equals: ['PASSPORT']}},
    {...file(`${prefix}frontSideFile`, 'Front of the document'), showWhen: {key: `${prefix}documentType`, equals: TWO_SIDED}},
    {...file(`${prefix}backSideFile`, 'Back of the document'), showWhen: {key: `${prefix}documentType`, equals: TWO_SIDED}},
];

/**
 * One field set per Wise KYC requirement type, as Auth would author them from Wise's guide. Allowed values are
 * abbreviated to a few examples; the shapes (which type each `data` member needs) are complete.
 */
const kycRequirementTypes: Record<string, DynamicFormField[]> = {
    ACCOUNT_INTENT: [
        select('accountIntent', 'How will you use the account?', [
            'PAYING_SUPPLIERS_CONTRACTORS_EMPLOYEES',
            'INVESTING_IN_FUNDS_STOCKS_BONDS_OPTIONS_FUTURES_OR_OTHER',
            'PAYING_RENT_UTILITIES_OR_PROPERTY_CHARGES',
        ]),
    ],
    ACCOUNT_PURPOSE: [select('accountPurpose', 'Purpose of the account', ['SENDING_MONEY_TO_FRIENDS_OR_FAMILY', 'PAYING_BILLS', 'RECEIVING_SALARY_OR_PENSION', 'INVESTING'])],
    ANNUAL_VOLUME: [amount('amount', 'Estimated yearly volume')],
    BUSINESS_ANNUAL_INCOME: [amount('amount', 'Gross yearly income')],
    BUSINESS_AUTHORISATION_ID: [file('files', 'Director identification document')],
    BUSINESS_AUTHORISATION_LETTER: [file('files', 'Authorisation letter')],
    BUSINESS_CONTROLLING_PERSON: [select('shareholderId', 'Controlling person', ['UBO_1', 'UBO_2']), text('businessTitle', 'Business title', {maxLength: 100})],
    BUSINESS_DIRECTORS_CHECK: [file('files', 'Director documents', 5)],
    BUSINESS_INCOME_CLASSIFICATION: [select('classificationType', 'CRS classification', ['ACTIVE_NFE', 'PASSIVE_NFE', 'FINANCIAL_INSTITUTION'])],
    BUSINESS_MONTHLY_VOLUME: [amount('amount', 'Estimated monthly volume')],
    BUSINESS_REGISTRATION_DOCS: [file('files', 'Registration documents', 5)],
    BUSINESS_SHAREHOLDER_CONTACT_DETAILS: [
        {
            key: 'businessShareholderContactDetails',
            label: 'Shareholder contact details',
            group: GROUP,
            type: 'list',
            required: true,
            minItems: 1,
            itemFields: [select('shareholderId', 'Shareholder', ['UBO_1', 'UBO_2']), text('email', 'Email', {keyboard: 'email', maxLength: 255})],
            refreshOnChange: false,
        },
    ],
    BUSINESS_SHAREHOLDERS_CHECK: [file('files', 'Shareholder documents', 5)],
    BUSINESS_SOURCE_OF_WEALTH: [
        multiselect('sourceOfWealthList', 'Source of wealth', ['BUSINESS_ACTIVITIES', 'INVESTMENTS', 'LOAN_OR_OTHER_FINANCING', 'DONATION', 'GRANTS', 'OTHER']),
        {...text('otherSourceOfWealthDescription', 'Describe the other source', {multiline: true, maxLength: 500}), showWhen: {key: 'sourceOfWealthList', equals: ['OTHER']}},
    ],
    BUSINESS_SOURCE_OF_WEALTH_INFO: [
        {
            key: 'sourceOfWealthList',
            label: 'Sources of wealth',
            group: GROUP,
            type: 'list',
            required: true,
            minItems: 1,
            itemFields: [
                select('businessSourceOfWealthInfo', 'Source', SOURCE_OF_WEALTH),
                {key: 'isSourceOfFund', label: 'This source funds the account', group: GROUP, type: 'boolean', required: false, refreshOnChange: false},
            ],
            refreshOnChange: false,
        },
    ],
    BUSINESS_SOURCE_OF_WEALTH_PROOF: [
        select('sourceOfWealthType', 'Source of wealth', SOURCE_OF_WEALTH),
        select('documentType', 'Document type', ['BANK_STATEMENT', 'AUDITED_FINANCIAL_STATEMENTS', 'TAX_DOCUMENTS', 'LOAN_AGREEMENT', 'GRANT_APPROVAL_LETTER']),
        file('files', 'Proof document', 5),
    ],
    BUSINESS_ULTIMATE_BENEFICIAL_OWNER_ID: idDocumentFields(''),
    BUSINESS_USE_CASE: [
        multiselect('useCases', 'How will the business use the account?', [
            'PAYING_SUPPLIERS_CONTRACTORS_OR_EMPLOYEES',
            'RECEIVE_PAYMENTS_FROM_CLIENTS',
            'TRANSFER_WITHIN_COMPANY_OR_GROUP',
            'OTHER',
        ]),
    ],
    ID_DOCUMENT: idDocumentFields(''),
    INCOME: [
        amount('amount', 'Gross yearly income'),
        select('incomeType', 'Income type', ['SALARY', 'INVESTMENTS', 'PENSION', 'FREELANCER']),
        text('incomeExplanation', 'Describe the income', {required: false, multiline: true, maxLength: 500}),
    ],
    INDIA_TRANSFER_PURPOSE: [select('purpose', 'Purpose of transfer', ['EDUCATION', 'FAMILY_MAINTENANCE', 'TRAVEL'])],
    JPN_BUSINESS_CERT: [file('files', 'Certificate of Registered Matters')],
    JPN_PERSONAL_MYNUMBER: [file('files', 'My Number document')],
    LEGAL_ENTITY_SHAREHOLDER: [
        {
            key: 'legalEntityShareholders',
            label: 'Legal entity shareholders',
            group: GROUP,
            type: 'list',
            required: false,
            itemFields: [
                text('name', 'Name', {maxLength: 255}),
                {key: 'country', label: 'Country', labelKey: 'common.country', group: GROUP, type: 'country', required: true, refreshOnChange: false},
                {key: 'ownershipPercentage', label: 'Ownership percentage', group: GROUP, type: 'percent', required: true, refreshOnChange: false},
            ],
            refreshOnChange: false,
        },
    ],
    PROOF_OF_TRADING_ADDRESS: [file('files', 'Proof of trading address')],
    SOURCE_OF_FUNDS: [select('sourceOfFunds', 'Source of funds', ['SALARY', 'SAVINGS', 'INVESTMENTS', 'LOAN']), file('files', 'Proof document')],
    SOURCE_OF_WEALTH: [multiselect('sourceOfWealthList', 'Source of wealth', ['SALARY', 'INVESTMENTS', 'INHERITANCE', 'OTHER'])],
    SOURCE_OF_WEALTH_INFO: [
        {
            key: 'sourceOfWealthList',
            label: 'Sources of wealth',
            group: GROUP,
            type: 'list',
            required: true,
            minItems: 1,
            itemFields: [
                select('sourceOfWealthInfo', 'Source', ['SALARY', 'INVESTMENTS', 'INHERITANCE']),
                {key: 'isSourceOfFund', label: 'This source funds the account', group: GROUP, type: 'boolean', required: false, refreshOnChange: false},
            ],
            refreshOnChange: false,
        },
    ],
    SOURCE_OF_WEALTH_PROOF: [select('sourceOfWealthType', 'Source of wealth', ['SALARY', 'INVESTMENTS', 'INHERITANCE']), file('files', 'Proof document', 5)],
    TAX_RESIDENCY: [
        {
            key: 'taxInfoList',
            label: 'Tax residencies',
            group: GROUP,
            type: 'list',
            required: true,
            minItems: 1,
            itemFields: [
                {key: 'taxCountry', label: 'Country of tax residency', labelKey: 'common.country', group: GROUP, type: 'country', required: true, refreshOnChange: false},
                text('tin', 'Tax identification number', {required: false, maxLength: 50}),
            ],
            refreshOnChange: false,
        },
    ],
    USE_CASE_COUNTRIES: [multiselect('countries', 'Countries you will send to or receive from', ['US', 'GB', 'DE', 'FR', 'IN', 'BR', 'AU', 'CA', 'JP', 'SG'])],
};

export default kycRequirementTypes;
