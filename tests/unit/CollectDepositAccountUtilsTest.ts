import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {getBankAccountFields, hasLocalBankAccountFields} from '@libs/BankAccountFields';
import {getSubmitParameters, getValidationErrors} from '@libs/CollectDepositAccountUtils';

import CONST from '@src/CONST';
import type {CollectDepositAccountForm} from '@src/types/form';

// Echoes the key back so assertions can tell the different failure messages apart.
const translate: LocaleContextProps['translate'] = (path, ...parameters): string => (parameters.length > 0 ? `${path}:${parameters.length}` : path);

const LOCAL = CONST.BANK_ACCOUNT.FIELDS_TYPE.LOCAL;
const INTERNATIONAL = CONST.BANK_ACCOUNT.FIELDS_TYPE.INTERNATIONAL;

describe('CollectDepositAccountUtils', () => {
    describe('getBankAccountFields', () => {
        it("collects the country's domestic inputs when the employer can pay it locally", () => {
            // Given a GB account the employer can reimburse domestically
            const fields = getBankAccountFields('GB', 'GBP', LOCAL);

            // Then the UK's own rails are asked for, rather than wire details
            expect(fields.routingNumber.label).toBe('Branch Sorting Code');
            expect(fields.accountNumber.label).toBe('Account Number');
        });

        it('falls back to the default wire mapping for a country with no override', () => {
            // Given a DE account, which has to be paid from abroad
            const fields = getBankAccountFields('DE', 'EUR', INTERNATIONAL);

            // Then SWIFT and IBAN are collected, because that is how the money arrives
            expect(fields.routingNumber.label).toBe('SWIFT BIC');
            expect(fields.accountNumber.label).toBe('IBAN');
        });

        it('uses the country override instead of the wire default where one exists', () => {
            // Given a CA account, which is paid from abroad but has no IBAN
            const fields = getBankAccountFields('CA', 'CAD', INTERNATIONAL);

            // Then Canada's own inputs are used, so the user is not asked for an IBAN they cannot supply
            expect(fields.accountNumber.label).toBe('Account Number');
            expect(fields.branchID.label).toBe('Transit Number');
        });
    });

    describe('hasLocalBankAccountFields', () => {
        it('reports the countries that have no domestic mapping', () => {
            // Given BG, which an employer can hold a business bank account in but which has no domestic mapping
            // Then it is reported as unmapped, so the flow asks for wire details instead of dead-ending
            expect(hasLocalBankAccountFields('BG')).toBe(false);
            expect(hasLocalBankAccountFields('GB')).toBe(true);
        });
    });

    describe('getValidationErrors', () => {
        const fieldsMap = {
            routingNumber: {label: 'Branch Sorting Code', validator: '[0-9]{6}', placeholder: '', errorMessage: ''},
            branchID: {label: 'IRC', validator: '.*', placeholder: '', errorMessage: ''},
        };

        it('reports a field as missing when its validator rejects an empty value', () => {
            // Given nothing entered at all
            const errors = getValidationErrors({} as CollectDepositAccountForm, fieldsMap, translate);

            // Then only the required field is reported, so the user is not told an optional one is missing
            expect(errors).toEqual({routingNumber: 'common.error.fieldRequired'});
        });

        it('leaves a field whose validator accepts an empty value alone', () => {
            // Given a valid routing number and no IRC, which is optional on a wire transfer
            const values = {routingNumber: '123456'} as CollectDepositAccountForm;

            // Then the step passes, because the only required field is filled
            expect(getValidationErrors(values, fieldsMap, translate)).toEqual({});
        });

        it('rejects a value that only partly matches the validator', () => {
            // Given a routing number one digit longer than the mapping allows
            const values = {routingNumber: '1234567'} as CollectDepositAccountForm;

            // When validating
            const errors = getValidationErrors(values, fieldsMap, translate);

            // Then it is rejected, because the validator is anchored rather than matched anywhere in the value
            expect(errors).toEqual({routingNumber: 'bankAccount.error.routingNumber'});
        });

        it('names the field rather than blaming a character when a length check fails', () => {
            // Given an account number shorter than its validator allows, with every character otherwise valid
            const lengthCheckedFields = {accountNumber: {label: 'Account Number', validator: '[0-9]{8}', placeholder: '', errorMessage: ''}};
            const values = {accountNumber: '1234'} as CollectDepositAccountForm;

            // When validating
            const errors = getValidationErrors(values, lengthCheckedFields, translate);

            // Then the message asks for a valid account number, since no character was actually wrong
            expect(errors).toEqual({accountNumber: 'bankAccount.error.accountNumber'});
        });
    });

    describe('getSubmitParameters', () => {
        it('sends the account and routing numbers outside additionalData', () => {
            // Given a completed GB account
            const values = {bankCountry: 'GB', bankCurrency: 'GBP', routingNumber: '123456', accountNumber: '12345678', bankName: 'Barclays'} as CollectDepositAccountForm;
            const fieldsMap = getBankAccountFields('GB', 'GBP', LOCAL);

            const parameters = getSubmitParameters(values, fieldsMap, LOCAL);
            const additionalData: unknown = JSON.parse(parameters.additionalData);

            // Then the two numbers sit at the top level and the rest is nested, which is the shape the API reads
            expect(parameters.routingNumber).toBe('123456');
            expect(parameters.accountNumber).toBe('12345678');
            expect(additionalData).toMatchObject({bankName: 'Barclays'});
            expect(additionalData).not.toHaveProperty('routingNumber');
            expect(additionalData).not.toHaveProperty('accountNumber');
        });

        it('sends the country, currency and fields type together', () => {
            // Given a DE account, which the employer cannot pay domestically
            const values = {bankCountry: 'DE', bankCurrency: 'EUR', routingNumber: 'BANK12DE', accountNumber: 'DE89370400440532013000'} as CollectDepositAccountForm;
            const fieldsMap = getBankAccountFields('DE', 'EUR', INTERNATIONAL);

            const additionalData: unknown = JSON.parse(getSubmitParameters(values, fieldsMap, INTERNATIONAL).additionalData);

            // Then it is marked international, which is what the API keys its own field validation off
            expect(additionalData).toMatchObject({country: 'DE', currency: 'EUR', fieldsType: INTERNATIONAL});
        });

        it('only accepts the bank verification warning on a resubmission', () => {
            // Given a completed GB account
            const values = {bankCountry: 'GB', bankCurrency: 'GBP', routingNumber: '123456', accountNumber: '12345678'} as CollectDepositAccountForm;
            const fieldsMap = getBankAccountFields('GB', 'GBP', LOCAL);

            // Then a first attempt leaves the warning to be raised, and resubmitting the same details accepts it
            expect(getSubmitParameters(values, fieldsMap, LOCAL).confirm).toBe(false);
            expect(getSubmitParameters(values, fieldsMap, LOCAL, true).confirm).toBe(true);
        });
    });
});
