import type {DynamicFormFieldOfType} from '@components/DynamicForm/types';

import type {DynamicFormField, DynamicFormFieldType} from '@src/types/onyx';

/** One field per type. Keying by type makes typecheck fail when a new type has no fixture field. */
const allFieldTypes = {
    text: {
        key: 'accountNumber',
        label: 'Account number',
        type: 'text',
        required: true,
        regex: '^\\d{8}$',
        minLength: 8,
        maxLength: 8,
        example: '12345678',
    },
    number: {
        key: 'yearsInBusiness',
        label: 'Years in business',
        type: 'number',
        required: false,
    },
    radio: {
        key: 'legalType',
        label: 'Recipient type',
        type: 'radio',
        required: true,
        values: [
            {key: 'PRIVATE', label: 'Person'},
            {key: 'BUSINESS', label: 'Business'},
        ],
    },
    select: {
        key: 'accountType',
        label: 'Account type',
        type: 'select',
        required: true,
        dependsOn: {
            key: 'legalType',
            valuesBy: {
                PRIVATE: [
                    {key: 'CHECKING', label: 'Checking'},
                    {key: 'SAVINGS', label: 'Savings'},
                ],
                BUSINESS: [
                    {key: 'CHECKING', label: 'Checking'},
                    {key: 'BUSINESS_CHECKING', label: 'Business checking'},
                ],
            },
        },
    },
    date: {
        key: 'dateOfBirth',
        label: 'Date of birth',
        type: 'date',
        required: true,
        rule: 'dateOfBirth',
    },
    boolean: {
        key: 'acceptTerms',
        label: 'I accept the terms',
        type: 'boolean',
        required: true,
    },
    country: {
        key: 'nationality',
        label: 'Nationality',
        type: 'country',
        required: true,
    },
    currency: {
        key: 'payoutCurrency',
        label: 'Payout currency',
        type: 'currency',
        required: true,
    },
    address: {
        key: 'homeAddress',
        label: 'Home address',
        type: 'address',
        required: true,
        rule: 'zipCode',
    },
} satisfies {[TType in DynamicFormFieldType]: DynamicFormFieldOfType<TType>};

const allFields: DynamicFormField[] = Object.values(allFieldTypes);

export default allFieldTypes;
export {allFields};
