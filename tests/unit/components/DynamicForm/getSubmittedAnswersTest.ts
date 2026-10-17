import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';
import getSubmittedAnswers, {getAnswerKeys} from '@components/DynamicForm/utils/getSubmittedAnswers';
import {getListItemSensitiveKey} from '@components/DynamicForm/utils/listItems';

import type {DynamicFormField} from '@src/types/onyx';

const cityKey = getAddressInputKeys('home').city;

describe('getSubmittedAnswers', () => {
    it('leaves out the answer of a field hidden by its controller', () => {
        // Given a text field shown only for business, with an answer left over from an earlier choice
        const fields: DynamicFormField[] = [
            {key: 'type', type: 'text', required: true},
            {key: 'ein', type: 'text', required: true, showWhen: {key: 'type', equals: ['BUSINESS']}},
        ];

        // When the answers are collected for a private recipient
        const answers = getSubmittedAnswers(fields, {type: 'PRIVATE', ein: '123'});

        // Then the stale answer is not submitted
        expect(answers).toEqual({type: 'PRIVATE'});
    });

    it('uses the whole form to find a controller on another page', () => {
        // Given a field whose controller sits on another page
        const controller: DynamicFormField = {key: 'type', type: 'text', required: true};
        const dependent: DynamicFormField = {key: 'ein', type: 'text', required: true, showWhen: {key: 'type', equals: ['BUSINESS']}};

        // When one page is collected with the whole form
        const answers = getSubmittedAnswers([dependent], {type: 'BUSINESS', ein: '123'}, [controller, dependent]);

        // Then the field counts as visible
        expect(answers).toEqual({ein: '123'});
    });

    it('submits the address parts and the chosen currency along with the field', () => {
        // Given an address and an amount that lets the user pick a currency
        const fields: DynamicFormField[] = [
            {key: 'home', type: 'address', required: true},
            {key: 'fee', type: 'amount', required: true, currencyKey: 'feeCurrency'},
        ];

        // When the answers are collected
        const answers = getSubmittedAnswers(fields, {home: '1 Main St', [cityKey]: 'Austin', fee: '100', feeCurrency: 'EUR'});

        // Then the currency is part of the answer, since the amount means nothing without it
        expect(answers).toMatchObject({home: '1 Main St', [cityKey]: 'Austin', fee: '100', feeCurrency: 'EUR'});
    });

    it('lists every answer key of a compound field', () => {
        // Given an address field, whose answer is spread over several keys
        const field: DynamicFormField = {key: 'home', type: 'address', required: true, sensitive: true};

        // When the answer keys are listed
        const keys = getAnswerKeys(field);

        // Then the address parts are included, so marking the field sensitive covers all of them
        expect(keys).toContain('home');
        expect(keys).toContain(cityKey);
    });

    it('submits each list entry with its sensitive answers kept in memory', () => {
        // Given a list of directors whose SSN is sensitive, so it is kept in memory under the entry instead of in the drafted entry
        const directors: DynamicFormField = {
            key: 'directors',
            type: 'list',
            required: true,
            itemFields: [
                {key: 'firstName', type: 'text', required: true},
                {key: 'ssn', type: 'text', required: true, sensitive: true},
            ],
        };
        const values = {directors: [{id: 'jane', firstName: 'Jane'}], [getListItemSensitiveKey('directors', 'jane', 'ssn')]: '123456789'};

        // When the answers are collected
        const answers = getSubmittedAnswers([directors], values);

        // Then the entry is sent whole, SSN included, without the memory key it was kept under
        expect(answers).toEqual({directors: [{id: 'jane', firstName: 'Jane', ssn: '123456789'}]});
    });
});
