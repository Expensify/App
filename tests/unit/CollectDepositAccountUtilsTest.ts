import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {getBankAccountFields} from '@libs/BankAccountFields';
import {getSubmitParameters, getValidationErrors} from '@libs/CollectDepositAccountUtils';

import CONST from '@src/CONST';
import type {CollectDepositAccountForm} from '@src/types/form';

// The utils only read `translate` to label errors, so echoing the key keeps the assertions readable.
const translate: LocaleContextProps['translate'] = (path, ...parameters): string => (parameters.length > 0 ? `${path}:${parameters.length}` : path);

describe('CollectDepositAccountUtils', () => {
    describe('getBankAccountFields', () => {
        it('returns the local mapping for a country the employer banks in', () => {
            // Given a GB account, which a collecting policy can pay domestically
            // When resolving the fields to render
            const fields = getBankAccountFields('GB', 'GBP', CONST.BANK_ACCOUNT.FIELDS_TYPE.LOCAL);

            // Then the GB domestic inputs are used
            expect(fields.routingNumber.label).toBe('Branch Sorting Code');
            expect(fields.accountNumber.label).toBe('Account Number');
        });

        it('falls back to the default wire mapping for an unlisted country', () => {
            // Given a DE account, which the employer cannot pay domestically
            // When resolving the fields to render
            const fields = getBankAccountFields('DE', 'EUR', CONST.BANK_ACCOUNT.FIELDS_TYPE.INTERNATIONAL);

            // Then SWIFT and IBAN are collected instead
            expect(fields.routingNumber.label).toBe('SWIFT BIC');
            expect(fields.accountNumber.label).toBe('IBAN');
        });

        it('uses the country override in the international mapping', () => {
            // Given a CA account, which has no IBAN
            // When resolving the fields to render
            const fields = getBankAccountFields('CA', 'CAD', CONST.BANK_ACCOUNT.FIELDS_TYPE.INTERNATIONAL);

            // Then Canada's own wire inputs are used rather than the IBAN default
            expect(fields.accountNumber.label).toBe('Account Number');
            expect(fields.branchID.label).toBe('Transit Number');
        });
    });

    describe('getValidationErrors', () => {
        const fieldsMap = {
            routingNumber: {label: 'Branch Sorting Code', validator: '[0-9]{6}', placeholder: '', errorMessage: ''},
            branchID: {label: 'IRC', validator: '.*', placeholder: '', errorMessage: ''},
        };

        it('reports a missing required field', () => {
            // Given no value for a field whose validator rejects an empty string
            // When validating
            // Then the field is reported as required
            expect(getValidationErrors({} as CollectDepositAccountForm, fieldsMap, translate)).toEqual({routingNumber: 'common.error.fieldRequired'});
        });

        it('accepts an empty value for a field whose validator allows it', () => {
            // Given a valid routing number and no IRC, which is optional on a wire transfer
            const values = {routingNumber: '123456'} as CollectDepositAccountForm;

            // When validating
            // Then only the required field matters, so there are no errors
            expect(getValidationErrors(values, fieldsMap, translate)).toEqual({});
        });

        it('rejects a value that does not match the whole validator', () => {
            // Given a routing number with more digits than the validator allows
            const values = {routingNumber: '1234567'} as CollectDepositAccountForm;

            // When validating
            // Then it is rejected, because the validator is anchored rather than matched anywhere in the value
            expect(getValidationErrors(values, fieldsMap, translate)).toEqual({routingNumber: 'common.error.invalidCharacter'});
        });
    });

    describe('getSubmitParameters', () => {
        it('keeps the account and routing numbers out of additionalData', () => {
            // Given a completed GB account
            const values = {bankCountry: 'GB', bankCurrency: 'GBP', routingNumber: '123456', accountNumber: '12345678', bankName: 'Barclays'} as CollectDepositAccountForm;
            const fieldsMap = getBankAccountFields('GB', 'GBP', CONST.BANK_ACCOUNT.FIELDS_TYPE.LOCAL);

            // When building the request
            const parameters = getSubmitParameters(values, fieldsMap, CONST.BANK_ACCOUNT.FIELDS_TYPE.LOCAL);

            // Then the two numbers are top level and the rest is nested, as the API expects
            expect(parameters.routingNumber).toBe('123456');
            expect(parameters.accountNumber).toBe('12345678');

            const additionalData: unknown = JSON.parse(parameters.additionalData);
            expect(additionalData).toMatchObject({bankName: 'Barclays'});
            expect(additionalData).not.toHaveProperty('routingNumber');
            expect(additionalData).not.toHaveProperty('accountNumber');
        });

        it('sends the country, currency and fields type the API validates against', () => {
            // Given a DE account, which the employer cannot pay domestically
            const values = {bankCountry: 'DE', bankCurrency: 'EUR', routingNumber: 'BANK12DE', accountNumber: 'DE89370400440532013000'} as CollectDepositAccountForm;
            const fieldsMap = getBankAccountFields('DE', 'EUR', CONST.BANK_ACCOUNT.FIELDS_TYPE.INTERNATIONAL);

            // When building the request
            const additionalData: unknown = JSON.parse(getSubmitParameters(values, fieldsMap, CONST.BANK_ACCOUNT.FIELDS_TYPE.INTERNATIONAL).additionalData);

            // Then it is marked international, which is how the API decides whether to validate the fields
            expect(additionalData).toMatchObject({country: 'DE', currency: 'EUR', fieldsType: CONST.BANK_ACCOUNT.FIELDS_TYPE.INTERNATIONAL});
        });

        it('only confirms unverifiable details when asked to', () => {
            // Given a completed GB account
            const values = {bankCountry: 'GB', bankCurrency: 'GBP', routingNumber: '123456', accountNumber: '12345678'} as CollectDepositAccountForm;
            const fieldsMap = getBankAccountFields('GB', 'GBP', CONST.BANK_ACCOUNT.FIELDS_TYPE.LOCAL);

            // When submitting for the first time
            // Then the bank verification warning is not pre-accepted
            expect(getSubmitParameters(values, fieldsMap, CONST.BANK_ACCOUNT.FIELDS_TYPE.LOCAL).confirm).toBe(false);

            // When resubmitting the same details after a warning
            // Then the warning is accepted so the account can be created
            expect(getSubmitParameters(values, fieldsMap, CONST.BANK_ACCOUNT.FIELDS_TYPE.LOCAL, true).confirm).toBe(true);
        });
    });
});
