import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';
import getSubmittedAnswers from '@components/DynamicForm/utils/getSubmittedAnswers';

import type {DynamicFormField} from '@src/types/onyx';

describe('getSubmittedAnswers', () => {
    it('drops answers to fields that are hidden or no longer in the schema', () => {
        // Given a company name answered while the recipient was a business, then the recipient switched to private
        const fields: DynamicFormField[] = [
            {key: 'legalType', type: 'radio', required: true, values: [{key: 'PRIVATE'}, {key: 'BUSINESS'}]},
            {key: 'companyName', type: 'text', required: true, showWhen: {key: 'legalType', equals: ['BUSINESS']}},
        ];
        const values = {legalType: 'PRIVATE', companyName: 'Acme', removedField: 'stale'};

        // When the answers are collected for submission
        const answers = getSubmittedAnswers(fields, values);

        // Then only the visible field's answer is sent
        expect(answers).toEqual({legalType: 'PRIVATE'});
    });

    it('keeps the address parts and the amount currency stored under their own keys', () => {
        // Given an address and an amount with a picked currency
        const fields: DynamicFormField[] = [
            {key: 'home', type: 'address', required: true},
            {key: 'volume', type: 'amount', required: true, currencyKey: 'volumeCurrency'},
        ];
        const addressKeys = getAddressInputKeys('home');
        const values = {home: '1 Main Street', [addressKeys.city]: 'Springfield', [addressKeys.zipCode]: '62701', volume: '100', volumeCurrency: 'EUR'};

        // When the answers are collected
        const answers = getSubmittedAnswers(fields, values);

        // Then every part travels with its field
        expect(answers).toEqual(values);
    });
});
