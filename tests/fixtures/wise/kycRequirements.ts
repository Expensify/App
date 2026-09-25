import type {WiseKYCRequirements} from '@src/types/onyx';

/** Three outstanding requirements as Auth flattens them from a Wise KYC review: one select, one document form, one hosted-only */
const kycRequirements: WiseKYCRequirements = [
    {
        key: 'ACCOUNT_PURPOSE',
        state: 'NOT_PROVIDED',
        hostedOnly: false,
        fields: [
            {
                key: 'accountPurpose',
                label: 'Purpose of the account',
                group: 'Account purpose',
                type: 'select',
                required: true,
                values: [
                    {key: 'SENDING_MONEY_TO_FRIENDS_OR_FAMILY', label: 'Sending money to friends or family'},
                    {key: 'MOVING_SAVINGS', label: 'Moving savings'},
                    {key: 'GENERAL_LIVING_EXPENSES', label: 'General living expenses'},
                    {key: 'BUYING_GOODS_OR_SERVICES_ABROAD', label: 'Buying goods or services abroad'},
                    {key: 'PAYING_FOR_MORTGAGE_OR_LOAN', label: 'Paying for a mortgage or loan'},
                    {key: 'PAYING_BILLS', label: 'Paying bills'},
                    {key: 'RECEIVING_SALARY_OR_PENSION', label: 'Receiving salary or pension'},
                    {key: 'INVESTING', label: 'Investing'},
                ],
                refreshOnChange: false,
            },
        ],
    },
    {
        key: 'ID_DOCUMENT',
        state: 'NOT_PROVIDED',
        hostedOnly: false,
        fields: [
            {
                key: 'issuingCountry',
                label: 'Issuing country',
                labelKey: 'common.country',
                group: 'Identity document',
                type: 'country',
                required: true,
                refreshOnChange: false,
            },
            {
                key: 'documentType',
                label: 'Document type',
                group: 'Identity document',
                type: 'select',
                required: true,
                values: [
                    {key: 'PASSPORT', label: 'Passport'},
                    {key: 'ID_CARD', label: 'ID card'},
                    {key: 'DRIVERS_LICENSE', label: "Driver's license"},
                    {key: 'TAX_ID', label: 'Tax ID'},
                    {key: 'RESIDENCE_PERMIT', label: 'Residence permit'},
                ],
                refreshOnChange: false,
            },
            {
                key: 'passportFile',
                label: 'Passport photo page',
                group: 'Identity document',
                type: 'file',
                required: true,
                maxFiles: 1,
                showWhen: {key: 'documentType', equals: ['PASSPORT']},
                refreshOnChange: false,
            },
            {
                key: 'frontSideFile',
                label: 'Front of the document',
                group: 'Identity document',
                type: 'file',
                required: true,
                maxFiles: 1,
                showWhen: {key: 'documentType', equals: ['ID_CARD', 'DRIVERS_LICENSE', 'TAX_ID', 'RESIDENCE_PERMIT']},
                refreshOnChange: false,
            },
            {
                key: 'backSideFile',
                label: 'Back of the document',
                group: 'Identity document',
                type: 'file',
                required: true,
                maxFiles: 1,
                showWhen: {key: 'documentType', equals: ['ID_CARD', 'DRIVERS_LICENSE', 'TAX_ID', 'RESIDENCE_PERMIT']},
                refreshOnChange: false,
            },
        ],
    },
    {
        key: 'LIVENESS_CHECK',
        state: 'NOT_PROVIDED',
        hostedOnly: true,
        fields: [],
    },
];

export default kycRequirements;
