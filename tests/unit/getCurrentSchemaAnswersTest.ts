import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';

import Log from '@libs/Log';

import getCurrentSchemaAnswers from '@pages/settings/Wallet/InternationalDepositAccount/getCurrentSchemaAnswers';

import type {DynamicFormSchema} from '@src/types/onyx';

import wiseBankAccountFieldsGB from '../data/wise/wiseBankAccountFieldsGB';

const ADDRESS_KEYS = getAddressInputKeys('address');

describe('getCurrentSchemaAnswers', () => {
    it('drops answers to fields the current schema no longer has', () => {
        // Given a draft that still holds an IBAN from an earlier schema, next to answers the GBP schema asks for
        const draftValues = {currency: 'GBP', sortCode: '403020', accountNumber: '12345678', iban: 'DE89370400440532013000'};

        // When the answers for a refresh are picked
        const answers = getCurrentSchemaAnswers(wiseBankAccountFieldsGB.schema, draftValues);

        // Then the IBAN is left out, so the server does not read it as part of the new form
        expect(answers).toEqual({currency: 'GBP', sortCode: '403020', accountNumber: '12345678'});
    });

    it('keeps every part of an address', () => {
        // Given an address saved as a street plus its parts under dotted keys, and a dotted key no field of the schema writes to
        const draftValues = {
            address: '123 Buckingham Palace Road',
            [ADDRESS_KEYS.city]: 'London',
            [ADDRESS_KEYS.zipCode]: 'SW1W 0DH',
            [ADDRESS_KEYS.country]: 'GB',
            [`${ADDRESS_KEYS.street}.unknownPart`]: 'stale',
        };

        // When the answers for a refresh are picked
        const answers = getCurrentSchemaAnswers(wiseBankAccountFieldsGB.schema, draftValues);

        // Then the address parts stay, while the dotted key that only shares the address prefix is dropped
        expect(answers).toEqual({address: '123 Buckingham Palace Road', [ADDRESS_KEYS.city]: 'London', [ADDRESS_KEYS.zipCode]: 'SW1W 0DH', [ADDRESS_KEYS.country]: 'GB'});
    });

    it('keeps answers to fields of a type this App version does not know, without logging them', () => {
        // Given a schema with a field of a type the App cannot render, whose answer is in the draft
        const logSpy = jest.spyOn(Log, 'warn');
        const schema: DynamicFormSchema = {
            fields: [
                {key: 'sortCode', type: 'text', label: 'Sort code', required: true},
                {key: 'futureField', type: 'futureType', label: 'Future field', required: true},
            ],
        };
        const draftValues = {sortCode: '403020', futureField: 'value', iban: 'DE89370400440532013000'};

        // When the answers for a refresh are picked
        const answers = getCurrentSchemaAnswers(schema, draftValues);

        // Then the unknown field's answer still reaches the server, and the schema problem is not logged again on every refresh
        expect(answers).toEqual({sortCode: '403020', futureField: 'value'});
        expect(logSpy).not.toHaveBeenCalled();
        logSpy.mockRestore();
    });

    it('returns no answers before a schema arrives', () => {
        // Given a draft but no schema yet
        const draftValues = {currency: 'GBP'};

        // When the answers are picked
        const answers = getCurrentSchemaAnswers(undefined, draftValues);

        // Then nothing is sent, since there are no fields to match against
        expect(answers).toEqual({});
    });
});
