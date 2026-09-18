import type {DynamicFormField} from '@src/types/onyx';

const ACCOUNT_DETAILS = 'Account details';
const ACCOUNT_HOLDER = 'Account holder details';

const legalType: DynamicFormField = {
    key: 'legalType',
    label: 'Recipient type',
    group: ACCOUNT_DETAILS,
    type: 'radio',
    required: true,
    values: [
        {key: 'PRIVATE', label: 'Person'},
        {key: 'BUSINESS', label: 'Business'},
    ],
    refreshOnChange: true,
};

const accountHolderName: DynamicFormField = {
    key: 'accountHolderName',
    label: 'Full name of the account holder',
    group: ACCOUNT_HOLDER,
    type: 'text',
    required: true,
    minLength: 2,
    maxLength: 255,
    refreshOnChange: false,
};

const address: DynamicFormField[] = [
    {key: 'address.country', label: 'Country', labelKey: 'common.country', group: ACCOUNT_HOLDER, type: 'country', required: true, refreshOnChange: true},
    {key: 'address.city', label: 'City', group: ACCOUNT_HOLDER, type: 'text', required: true, maxLength: 255, refreshOnChange: false},
    {key: 'address.firstLine', label: 'Address', labelKey: 'common.address', group: ACCOUNT_HOLDER, type: 'text', required: true, maxLength: 255, refreshOnChange: false},
    {key: 'address.postCode', label: 'Post code', group: ACCOUNT_HOLDER, type: 'text', required: true, maxLength: 32, refreshOnChange: false},
];

/** Auth's translation of GET /account-requirements for the corridors Release 2 ships with; `type` values are the four Wise emits */
const accountRequirements: Record<string, DynamicFormField[]> = {
    GBP_SORT_CODE: [
        legalType,
        {
            key: 'sortCode',
            label: 'UK sort code',
            group: ACCOUNT_DETAILS,
            type: 'text',
            required: true,
            regex: '^\\d{6}$',
            minLength: 6,
            maxLength: 6,
            example: '401276',
            refreshOnChange: false,
        },
        {
            key: 'accountNumber',
            label: 'Account number',
            labelKey: 'bankAccount.accountNumber',
            group: ACCOUNT_DETAILS,
            type: 'text',
            required: true,
            regex: '^\\d{8}$',
            minLength: 8,
            maxLength: 8,
            example: '12345678',
            refreshOnChange: false,
        },
        accountHolderName,
        ...address,
    ],
    USD_ABA: [
        legalType,
        {
            key: 'abartn',
            label: 'ACH routing number',
            group: ACCOUNT_DETAILS,
            type: 'text',
            required: true,
            regex: '^\\d{9}$',
            minLength: 9,
            maxLength: 9,
            example: '111000025',
            refreshOnChange: false,
        },
        {
            key: 'accountNumber',
            label: 'Account number',
            labelKey: 'bankAccount.accountNumber',
            group: ACCOUNT_DETAILS,
            type: 'text',
            required: true,
            regex: '^\\d{4,17}$',
            minLength: 4,
            maxLength: 17,
            refreshOnChange: false,
        },
        {
            key: 'accountType',
            label: 'Account type',
            group: ACCOUNT_DETAILS,
            type: 'select',
            required: true,
            values: [
                {key: 'CHECKING', label: 'Checking'},
                {key: 'SAVINGS', label: 'Savings'},
            ],
            refreshOnChange: false,
        },
        accountHolderName,
        ...address,
        {
            key: 'address.state',
            label: 'State',
            group: ACCOUNT_HOLDER,
            type: 'select',
            required: true,
            values: [
                {key: 'CA', label: 'California'},
                {key: 'NY', label: 'New York'},
            ],
            refreshOnChange: false,
        },
    ],
    EUR_IBAN: [
        legalType,
        {
            key: 'IBAN',
            label: 'IBAN',
            group: ACCOUNT_DETAILS,
            type: 'text',
            required: true,
            regex: '^[A-Z]{2}\\d{2}[A-Z0-9]{11,30}$',
            minLength: 15,
            maxLength: 34,
            example: 'DE89370400440532013000',
            refreshOnChange: false,
        },
        accountHolderName,
        ...address,
    ],
    BRL_LOCAL: [
        legalType,
        {key: 'cpf', label: 'Recipient tax ID (CPF)', group: ACCOUNT_DETAILS, type: 'text', required: true, regex: '^\\d{11}$', minLength: 11, maxLength: 11, refreshOnChange: false},
        {
            key: 'bankCode',
            label: 'Bank',
            group: ACCOUNT_DETAILS,
            type: 'select',
            required: true,
            values: Array.from({length: 12}, (_, index) => ({key: `${100 + index}`, label: `Bank ${100 + index}`})),
            refreshOnChange: false,
        },
        {key: 'branchCode', label: 'Branch code', group: ACCOUNT_DETAILS, type: 'text', required: true, regex: '^\\d{4}(-?\\d{1})?$', refreshOnChange: false},
        {
            key: 'accountNumber',
            label: 'Account number',
            labelKey: 'bankAccount.accountNumber',
            group: ACCOUNT_DETAILS,
            type: 'text',
            required: true,
            regex: '^\\d{1,13}(-?\\d)?$',
            refreshOnChange: false,
        },
        {
            key: 'accountType',
            label: 'Account type',
            group: ACCOUNT_DETAILS,
            type: 'select',
            required: true,
            values: [
                {key: 'CHECKING', label: 'Checking'},
                {key: 'SAVINGS', label: 'Savings'},
            ],
            refreshOnChange: false,
        },
        {key: 'phoneNumber', label: 'Phone number', group: ACCOUNT_HOLDER, type: 'text', required: true, keyboard: 'tel', refreshOnChange: false},
        accountHolderName,
        ...address,
    ],
};

export default accountRequirements;
