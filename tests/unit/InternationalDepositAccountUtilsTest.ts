import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {getAccountDetailsFieldsMap, getValidationErrors} from '@pages/settings/Wallet/InternationalDepositAccount/utils';

import type {CorpayFormField} from '@src/types/onyx/CorpayFields';

const translate: LocaleContextProps['translate'] = (path, ...parameters) => {
    parameters.some(() => false);
    return path;
};

function createCorpayField(id: string, isRequired: boolean, label = id, validationRules: CorpayFormField['validationRules'] = []): CorpayFormField {
    return {
        id,
        isRequired,
        isRequiredInValueSet: false,
        label,
        errorMessage: '',
        regEx: '',
        validationRules,
    };
}

function createFormValues(swiftBicCode: string): Parameters<typeof getValidationErrors>[0] {
    return {swiftBicCode};
}

describe('getAccountDetailsFieldsMap', () => {
    const routingNumber = createCorpayField('routingNumber', true, 'Routing Number');
    const swiftBicCode = createCorpayField('swiftBicCode', false, 'Swift Code');
    const accountNumber = createCorpayField('accountNumber', true, 'Account Number');
    const ibanAccountNumber = createCorpayField('accountNumber', false, 'IBAN Number');

    it('leaves fields unchanged when international deposit details are not collected', () => {
        const fields = {routingNumber, swiftBicCode, accountNumber};
        expect(getAccountDetailsFieldsMap(fields, false)).toBe(fields);
    });

    it('leaves fields unchanged when no IBAN or SWIFT labels are present', () => {
        const fields = {routingNumber, accountNumber};
        const result = getAccountDetailsFieldsMap(fields, true);

        expect(result.routingNumber.isRequired).toBe(true);
        expect(result.accountNumber.isRequired).toBe(true);
    });

    it('forces IBAN and SWIFT labeled fields to be required when collecting international deposit details', () => {
        const fields = {routingNumber, swiftBicCode, accountNumber: ibanAccountNumber};
        const result = getAccountDetailsFieldsMap(fields, true);

        expect(result.swiftBicCode.isRequired).toBe(true);
        expect(result.accountNumber.isRequired).toBe(true);
        expect(result.routingNumber.isRequired).toBe(true);
        expect(fields.swiftBicCode.isRequired).toBe(false);
        expect(fields.accountNumber.isRequired).toBe(false);
    });

    it('does not force a generic account number to be required', () => {
        const optionalAccountNumber = createCorpayField('accountNumber', false, 'Account Number');
        const fields = {routingNumber, accountNumber: optionalAccountNumber};
        const result = getAccountDetailsFieldsMap(fields, true);

        expect(result.accountNumber.isRequired).toBe(false);
    });
});

describe('getValidationErrors', () => {
    it('uses Corpay validation rules for a required SWIFT field', () => {
        const swiftBicCode = createCorpayField('swiftBicCode', true, 'Swift Code', [{regEx: '^.{0,12}$', errorMessage: 'Swift must be less than 12 characters'}]);
        const fields = {swiftBicCode};

        expect(getValidationErrors(createFormValues(''), fields, translate)).toEqual({swiftBicCode: 'common.error.fieldRequired'});
        expect(getValidationErrors(createFormValues('1234567890123'), fields, translate)).toEqual({swiftBicCode: 'Swift must be less than 12 characters'});
        expect(getValidationErrors(createFormValues('ABCD1234'), fields, translate)).toEqual({});
    });
});
