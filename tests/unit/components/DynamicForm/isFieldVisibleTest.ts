import isFieldVisible from '@components/DynamicForm/utils/isFieldVisible';

import type {DynamicFormField} from '@src/types/onyx';

const legalType: DynamicFormField = {
    key: 'legalType',
    type: 'radio',
    required: true,
    values: [{key: 'PRIVATE'}, {key: 'BUSINESS'}],
};

const companyName: DynamicFormField = {
    key: 'companyName',
    type: 'text',
    required: true,
    showWhen: {key: 'legalType', equals: ['BUSINESS']},
};

const companyNumber: DynamicFormField = {
    key: 'companyNumber',
    type: 'text',
    required: true,
    showWhen: {key: 'companyName', equals: ['Acme']},
};

describe('isFieldVisible', () => {
    it('shows a field without showWhen', () => {
        // Given a field that does not depend on any answer
        // When its visibility is checked with no answers
        // Then it is visible
        expect(isFieldVisible(legalType, {}, [legalType])).toBe(true);
    });

    it('shows a field only while the controlling answer matches', () => {
        // Given a field shown only for business recipients
        const fields = [legalType, companyName];

        // When the recipient type is business, then private
        // Then the field is visible only for business
        expect(isFieldVisible(companyName, {legalType: 'BUSINESS'}, fields)).toBe(true);
        expect(isFieldVisible(companyName, {legalType: 'PRIVATE'}, fields)).toBe(false);
    });

    it('hides a field while its controlling field is hidden, even if the hidden field still has a matching answer', () => {
        // Given a chain where companyNumber depends on companyName, which depends on legalType
        const fields = [legalType, companyName, companyNumber];

        // When companyName keeps a matching answer from before the user switched to a private recipient
        const values = {legalType: 'PRIVATE', companyName: 'Acme'};

        // Then companyNumber stays hidden, because the question it depends on is no longer asked
        expect(isFieldVisible(companyNumber, values, fields)).toBe(false);
    });

    it('stops on a showWhen cycle instead of recursing forever', () => {
        // Given two fields that each depend on the other, which is a broken schema
        const first: DynamicFormField = {
            key: 'first',
            type: 'text',
            required: false,
            showWhen: {key: 'second', equals: ['yes']},
        };
        const second: DynamicFormField = {
            key: 'second',
            type: 'text',
            required: false,
            showWhen: {key: 'first', equals: ['yes']},
        };

        // When visibility is checked
        // Then it falls back to the controlling answer alone
        expect(isFieldVisible(first, {first: 'yes', second: 'yes'}, [first, second])).toBe(true);
    });
});
