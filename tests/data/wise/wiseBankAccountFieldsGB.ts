import type {DynamicFormSchema} from '@src/types/onyx';

type WiseBankAccountFieldsFixture = {
    country: string;
    currency: string;
    defaultPayoutType: string;
    payoutTypes: Array<{type: string; title: string; schema: DynamicFormSchema}>;
};

/** What GetWiseBankAccountFields writes to Onyx for a GBP account held in the UK */
const wiseBankAccountFieldsGB: WiseBankAccountFieldsFixture = {
    country: 'GB',
    currency: 'GBP',
    defaultPayoutType: 'sort_code',
    payoutTypes: [
        {
            type: 'sort_code',
            title: 'Local bank account',
            schema: {
                pages: [
                    {
                        key: 'accountDetails',
                        titleKey: 'addPersonalBankAccount.accountDetailsStepHeader',
                        content: [
                            {key: 'currency', type: 'currency', labelKey: 'common.currency', required: true, refreshOnChange: true},
                            {
                                key: 'accountNumber',
                                type: 'text',
                                label: 'Account number',
                                labelKey: 'bankAccount.accountNumber',
                                required: true,
                                regex: '^\\d{8}$',
                                minLength: 8,
                                maxLength: 8,
                                example: '12345678',
                            },
                            {key: 'sortCode', type: 'text', label: 'Sort code', required: true, regex: '^\\d{6}$', minLength: 6, maxLength: 6, example: '403020'},
                        ],
                    },
                    {
                        key: 'accountHolderDetails',
                        titleKey: 'addPersonalBankAccount.accountHolderInformationStepHeader',
                        content: [
                            {
                                key: 'accountHolderName',
                                type: 'text',
                                label: 'Account holder full name',
                                required: true,
                                minLength: 2,
                                maxLength: 140,
                                regex: '^[0-9A-Za-zÀ-ÖØ-öø-ÿ-_()\'*,.%#^@{}~<>+$"\\[\\]\\\\ ]+$',
                            },
                            {key: 'address', type: 'address', labelKey: 'common.personalAddress', required: true, refreshOnChange: true},
                        ],
                    },
                ],
            },
        },
    ],
};

export default wiseBankAccountFieldsGB;
