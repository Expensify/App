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

    it('sends list choices as chosen, leaving a choice no longer offered to validation', () => {
        // Given industries whose options depend on the business type, holding a retail choice from before the type changed to services
        const fields: DynamicFormField[] = [
            {key: 'industries', type: 'multiselect', required: true, dependsOn: {key: 'businessType', valuesBy: {RETAIL: [{key: 'CLOTHING'}], SERVICES: [{key: 'CONSULTING'}]}}},
        ];
        const values = {businessType: 'SERVICES', industries: ['CLOTHING', 'CONSULTING']};

        // When the answers are collected
        const answers = getSubmittedAnswers(fields, values);

        // Then both choices are sent as they are, since validation flags the stale one before the form can be submitted
        expect(answers).toEqual({industries: ['CLOTHING', 'CONSULTING']});
    });

    it('drops a field hidden by an answer on another page', () => {
        // Given a proof revealed by a source of funds, which is only asked for risky industries
        const industry: DynamicFormField = {key: 'industry', type: 'select', required: true, values: [{key: 'SAFE'}, {key: 'RISKY'}]};
        const sourceOfFunds: DynamicFormField = {key: 'sourceOfFunds', type: 'select', required: true, showWhen: {key: 'industry', equals: ['RISKY']}};
        const proof: DynamicFormField = {key: 'proof', type: 'text', required: true, showWhen: {key: 'sourceOfFunds', equals: ['SALARY']}};

        // When the proof page's answers are collected for a safe industry, with answers left from an earlier risky one
        const answers = getSubmittedAnswers([proof], {industry: 'SAFE', sourceOfFunds: 'SALARY', proof: 'payslip'}, [industry, sourceOfFunds, proof]);

        // Then the proof is not sent, matching the page, which does not ask for it
        expect(answers).toEqual({});
    });
});
