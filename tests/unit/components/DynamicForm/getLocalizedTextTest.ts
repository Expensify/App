import {getInputLabel} from '@components/DynamicForm/utils/getLocalizedText';

import type {DynamicFormField} from '@src/types/onyx';

import {translateLocal} from '../../../utils/TestHelper';

describe('getInputLabel', () => {
    it('marks only the fields the user may leave empty as optional', () => {
        // Given a required field, an optional one, a readonly one and an optional checkbox
        const required: DynamicFormField = {key: 'name', type: 'text', required: true, label: 'Name'};
        const optional: DynamicFormField = {key: 'nickname', type: 'text', required: false, label: 'Nickname'};
        const readonly: DynamicFormField = {key: 'country', type: 'text', required: false, readonly: true, label: 'Country'};
        const checkbox: DynamicFormField = {key: 'newsletter', type: 'boolean', required: false, presentation: 'checkbox', label: 'Send me news'};

        // When their input labels are built
        // Then only the optional field is marked, since a readonly field asks nothing and leaving a checkbox unchecked is an answer
        expect(getInputLabel(required, translateLocal)).toBe('Name');
        expect(getInputLabel(optional, translateLocal)).toBe(`Nickname (${translateLocal('common.optional')})`);
        expect(getInputLabel(readonly, translateLocal)).toBe('Country');
        expect(getInputLabel(checkbox, translateLocal)).toBe('Send me news');
    });
});
